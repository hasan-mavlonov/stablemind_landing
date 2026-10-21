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

It raises on failure (no key, transport error after the client's own retries, or no
parseable JSON) so callers fall back to their deterministic heuristic. Transport retries
on 5xx are left to the OpenAI client; the retry here is specifically for the parse-empty
case Gemma's ``<thought>`` causes.
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


def call_timeout(preferred, *, final=False):
    """The timeout for the next call: ``preferred``, cut down to what the budget has left.

    Raises ``TimeoutError`` when the budget is used up, so the caller falls back offline.
    """
    budget = _DEADLINE.get()
    if budget is None:
        return preferred
    deadline, reserve = budget
    remaining = deadline - time.monotonic() - (0.0 if final else reserve)
    if remaining < MIN_CALL_SECONDS:
        raise TimeoutError("the LLM time budget for this request is used up")
    return min(preferred, remaining)


def make_client():
    """An OpenAI-compatible client. Under a time budget it never retries on its own, since
    those retries (and their back-off waits) are invisible to the budget."""
    from openai import OpenAI  # lazy: the heuristic fallbacks work without this package

    retries = 0 if _DEADLINE.get() is not None else 2
    return OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL, max_retries=retries)

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
        completion = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=call_timeout(timeout),
        )
        try:
            return parse_json_object(completion.choices[0].message.content)
        except ValueError as exc:   # truncated mid-thought / no JSON -> nudge and retry
            last_exc = exc
            log.info("JSON parse failed (attempt %d/%d): %s",
                     attempt + 1, retries + 1, exc)
    raise last_exc
