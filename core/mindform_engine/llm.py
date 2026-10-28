"""Shared OpenAI-compatible JSON call for the formation engines (Gemma-hardened).

Every formation node -- trait push (``llm_impact``), values, moral, belief, and genesis
(``temperament``) -- asks the configured chat model (Gemini 3.5 Flash by default) for a
small JSON object. Gemma emits a ``<thought>`` block before its answer that cannot be
turned off, so a too-small token budget truncates the reply mid-thought and leaves no
JSON to parse (the classic ``Expecting value: line 1 column 1 (char 0)``).

This helper centralizes the fix:
  * a generous ``max_tokens`` so the thought can finish AND the JSON still follows;
  * ``config.parse_json_object`` to strip the reasoning / code fences before parsing;
  * one retry that nudges the model to emit JSON only, for the rare truncation.

It raises on failure (no key, transport error after the retries, or no parseable JSON) so
callers fall back to their deterministic heuristic. Outside a time budget, transport retries
are left to the OpenAI client; inside one, ``create_completion`` retries a transient error
(overload, rate limit, dropped connection) once itself. The JSON-only retry here is
specifically for the parse-empty case Gemma's ``<thought>`` causes.
"""

import contextvars
import logging
import time
from contextlib import contextmanager

from .config import LLM_MODEL, LLM_BASE_URL, LLM_API_KEY, parse_json_object

log = logging.getLogger("mindform.llm")

# --- Per-request time budget --------------------------------------------------------
# One demo turn makes several LLM calls in sequence (appraisal, the three formation
# pushes, beliefs, the reply). With per-call timeouts alone, plus the OpenAI client's own
# hidden retries (2 by default, including rate-limit waits), a slow or rate-limited model
# stretched a single turn to minutes: past Cloudflare's 100s limit and gunicorn's worker
# timeout, which visitors saw as HTTP 502. A budget caps every call made inside it
# *together*; once it runs out, calls fail fast and each caller uses its offline heuristic.
_DEADLINE = contextvars.ContextVar("mindform_llm_deadline", default=None)
# Below this many seconds left, a call isn't started: it couldn't finish in time anyway.
MIN_CALL_SECONDS = 1.5


@contextmanager
def time_budget(seconds, reserve=0.0):
    """Cap the total time all LLM calls made inside this block may take.

    The last ``reserve`` seconds are kept for calls made with ``final=True`` (the reply), so
    slow earlier steps fall back offline before they can starve the part visitors read.
    """
    token = _DEADLINE.set((time.monotonic() + seconds, reserve))
    try:
        yield
    finally:
        _DEADLINE.reset(token)


def _remaining(final):
    """Seconds this call may still use, or ``None`` outside a budget."""
    budget = _DEADLINE.get()
    if budget is None:
        return None
    deadline, reserve = budget
    return deadline - time.monotonic() - (0.0 if final else reserve)


def call_timeout(preferred, *, final=False):
    """The timeout for the next call: ``preferred``, cut down to what the budget has left.

    Raises ``TimeoutError`` when the budget is used up, so the caller falls back offline.
    """
    remaining = _remaining(final)
    if remaining is None:
        return preferred
    if remaining < MIN_CALL_SECONDS:
        raise TimeoutError("the LLM time budget for this request is used up")
    return min(preferred, remaining)


def make_client():
    """An OpenAI-compatible client. Under a time budget it never retries on its own, since
    those retries (and their back-off waits) are invisible to the budget."""
    from openai import OpenAI  # lazy: the heuristic fallbacks work without this package

    retries = 0 if _DEADLINE.get() is not None else 2
    return OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL, max_retries=retries)


# Gemini regularly answers "model overloaded" (503) or a rate limit (429) that clears within
# a second or two. Under a budget the client's own retries are off, so ``create_completion``
# retries those once itself, where the budget sees the wait. Before this, one overload was
# enough to drop a step (often the reply) to its offline fallback.
RETRY_PAUSE = 0.75


def _transient(exc):
    """Whether a failed call is worth one quick retry: an overload, a rate limit or a dropped
    connection. A timeout is not: it has already used up its share of the budget."""
    try:
        import openai
        timeout_error = openai.APITimeoutError
        transient = (openai.APIConnectionError, openai.RateLimitError, openai.InternalServerError)
    except (ImportError, AttributeError):
        return False
    return isinstance(exc, transient) and not isinstance(exc, timeout_error)


def create_completion(client, *, timeout, final=False, **params):
    """``client.chat.completions.create`` with its timeout cut to the budget (see
    ``call_timeout``), retried once after a short pause on a transient error when the budget
    still has room for it. Outside a budget the client's own retries apply instead."""
    retry_left = _DEADLINE.get() is not None
    while True:
        try:
            return client.chat.completions.create(
                timeout=call_timeout(timeout, final=final), **params)
        except Exception as exc:
            remaining = _remaining(final)
            if not (retry_left and _transient(exc)
                    and remaining is not None and remaining - RETRY_PAUSE >= MIN_CALL_SECONDS):
                raise
            retry_left = False
            log.info("LLM call failed (%s: %s); retrying once", type(exc).__name__, exc)
            time.sleep(RETRY_PAUSE)


# Gemma's <thought> can run long; give it room to finish and still reach the JSON.
# max_tokens is a ceiling, not a target -- short replies stop early and cost nothing extra.
JSON_MAX_TOKENS = 2048
_JSON_ONLY_NUDGE = ("\n\nReturn ONLY the JSON object now -- no <thought>, no thinking, "
                    "no explanation before or after it.")

# A single chat turn chains several of these calls (appraisal, formation, reply); each one
# getting to wait the full 30s -- twice, with the retry -- is what stacked up past gunicorn's
# worker timeout and killed the request outright. 20s is still generous for a JSON-sized
# reply and keeps a fully-retried call well under a minute.
NETWORK_TIMEOUT = 20


def complete_json(system_prompt, user_content, *, temperature=0.2,
                  max_tokens=JSON_MAX_TOKENS, retries=1, timeout=NETWORK_TIMEOUT):
    """Call the configured model and return a parsed JSON object (a dict).

    Raises ``RuntimeError`` when no API key is set, propagates a transport error if the
    request fails, and re-raises the last parse error if every attempt yields no JSON --
    so the caller can fall back to its heuristic.
    """
    if not LLM_API_KEY:
        raise RuntimeError("no LLM API key is set (GEMINI_API_KEY)")

    client = make_client()
    last_exc = None
    for attempt in range(retries + 1):
        content = user_content if attempt == 0 else user_content + _JSON_ONLY_NUDGE
        completion = create_completion(
            client,
            timeout=timeout,
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        try:
            return parse_json_object(completion.choices[0].message.content)
        except ValueError as exc:   # truncated mid-thought / no JSON -> nudge and retry
            last_exc = exc
            log.info("JSON parse failed (attempt %d/%d): %s",
                     attempt + 1, retries + 1, exc)
    raise last_exc


def health_check(timeout=20):
    """One tiny live call to the configured model, for the demo's staff-only health page.

    Never raises: on failure the error says what to fix (API key, model name, quota...).
    """
    from urllib.parse import urlsplit

    report = {"name": LLM_MODEL, "endpoint": urlsplit(LLM_BASE_URL).netloc or LLM_BASE_URL,
              "api_key_set": bool(LLM_API_KEY)}
    if not LLM_API_KEY:
        report["status"] = "no API key: set GEMINI_API_KEY; until then every step answers offline"
        return report
    started = time.monotonic()
    try:
        from openai import OpenAI

        client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL, max_retries=0)
        completion = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": "Reply with the single word: ready"}],
            max_tokens=256,
            timeout=timeout,
        )
        choice = completion.choices[0]
        report.update(status="ok", reply=(choice.message.content or "")[:80],
                      finish_reason=choice.finish_reason)
    except Exception as exc:
        report.update(status="error", error=f"{type(exc).__name__}: {exc}"[:500])
    report["seconds"] = round(time.monotonic() - started, 2)
    return report
