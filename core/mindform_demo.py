"""MindForm demo — the personality-engine cockpit, served inside the Django site.

The browser cockpit (templates/core/mindform_console.html + static/mindform/*) is
the unchanged MindForm Console front-end. These views replace the demo's original
stdlib ``http.server`` (web/server.py): they expose the same JSON API, but route it
through Django and back the engine with a *per-visitor* character store so two
people talking to the demo never collide.

The engine itself (core/mindform_engine/) is vendored from the mindform_v0 repo and
runs on the Python standard library alone — appraisal, the interpretation lens,
trait/values/moral pushes, drives, self-concept, behavior, expression, and a
rule-based in-character reply all have deterministic offline paths. With a
GEMINI_API_KEY in the environment it transparently upgrades to LLM-quality
perception, formation, and replies; without one (the default here) everything
still works offline. The heavy optional modules (encoder/memory/appraisal_head)
are not vendored, so recall/recurrence and belief formation stay dormant — the
bridge's guarded lazy imports skip them cleanly.

Two guards keep a slow or unavailable model from surfacing as HTTP 502s:
  * every request that may call the LLM runs under one time budget
    (settings.DEMO_TURN_BUDGET_SECONDS, see mindform_engine/llm.py); once it is spent,
    the remaining steps use their offline paths, so a turn always answers in time;
  * settings.DEMO_ENABLED=False switches the demo off: the page shows a friendly
    "temporarily offline" state and the API answers 503 instead of running the engine.
"""

import json
import logging
import os
import re
import secrets
import shutil
import tempfile
import time
from functools import wraps

from django.conf import settings
from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils.cache import add_never_cache_headers
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .mindform_engine import bridge, llm, personality

log = logging.getLogger("mindform.demo")

# Per-visitor character stores live here (git-ignored, per-machine runtime data).
_DATA_HOME = os.path.join(settings.BASE_DIR, "mindform_data")

# Two ready-to-talk-to characters so the picker is never empty on a first visit.
# (identity fields, 1-5 OCEAN levels) — the same manual-creation path the UI uses.
_SEED_CHARACTERS = [
    (
        {"name": "Aisha", "age": "24", "gender": "Female",
         "origin": "Lahore", "culture": "Punjabi", "language": "Urdu"},
        {"O": 5, "C": 3, "E": 2, "A": 4, "N": 5},   # curious, reserved, sensitive
    ),
    (
        {"name": "Diego", "age": "31", "gender": "Male",
         "origin": "Madrid", "culture": "Spanish", "language": "Spanish"},
        {"O": 3, "C": 5, "E": 5, "A": 4, "N": 1},   # disciplined, outgoing, calm
    ),
]


# --- Per-visitor store -------------------------------------------------------
# Each visitor's characters live in their own folder, named by a random id kept in a signed
# cookie. The folder used to be named by the raw session cookie, which Django hands over
# unchecked until the session is loaded, so a forged "sessionid=../../x" pointed the engine
# at any folder on the server. A signed id that must be 32 hex characters can't, and the
# demo no longer needs the database: a paused or unreachable one took the demo down with it.
STORE_COOKIE = "mindform_demo"
STORE_MAX_AGE = 30 * 24 * 3600            # a returning visitor keeps their characters 30 days
_STORE_SALT = "core.mindform_demo.store"
_STORE_ID = re.compile(r"[0-9a-f]{32}")


def _visitor_store(request):
    """``(store_id, is_new)``: the id from this visitor's signed cookie, else a fresh one."""
    cached = getattr(request, "_mindform_store", None)
    if cached is None:
        store_id = request.get_signed_cookie(STORE_COOKIE, default=None, salt=_STORE_SALT,
                                             max_age=STORE_MAX_AGE)
        if store_id and _STORE_ID.fullmatch(store_id):
            cached = (store_id, False)
        else:
            cached = (secrets.token_hex(16), True)
        request._mindform_store = cached
    return cached


def _seed_if_empty():
    """Populate a brand-new (empty) store with the starter characters."""
    if personality.list_characters():
        return
    for identity, levels in _SEED_CHARACTERS:
        try:
            bridge.create_manual(identity, levels)
        except Exception:                 # a bad seed must never break the demo
            log.exception("seeding starter character %s failed", identity.get("name"))


def _uses_store(view):
    """Run the view against this visitor's store (seeded with the starter characters), give a
    new visitor their cookie, and keep the per-visitor answer out of every cache."""
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        store_id, is_new = _visitor_store(request)
        personality.set_data_root(os.path.join(_DATA_HOME, store_id))
        _seed_if_empty()
        response = view(request, *args, **kwargs)
        if is_new:
            response.set_signed_cookie(
                STORE_COOKIE, store_id, salt=_STORE_SALT, max_age=STORE_MAX_AGE,
                path=reverse("mindform_demo"), secure=settings.SESSION_COOKIE_SECURE,
                httponly=True, samesite="Lax",
            )
        add_never_cache_headers(response)
        return response
    return wrapped


def _json_body(request):
    try:
        return json.loads((request.body or b"").decode("utf-8") or "{}")
    except (ValueError, UnicodeDecodeError):
        return {}


def _run(produce):
    """Call an engine function and shape the result/errors like web/server.py did."""
    try:
        return JsonResponse(produce())
    except FileNotFoundError:
        return JsonResponse({"error": "character not found"}, status=404)
    except Exception:                      # the details go to the log, never to the browser
        log.exception("mindform demo API error")
        return JsonResponse({"error": "the engine hit an error, please try again"}, status=500)


# Share of a turn's budget kept for the in-character reply, the part visitors actually read:
# when the model is slow, the formation steps fall back offline first.
REPLY_SHARE = 0.3


def _within_budget(engine_call, *args, reply_share=0.0):
    """Run an engine call that may reach the LLM under the demo's per-request time budget."""
    seconds = settings.DEMO_TURN_BUDGET_SECONDS
    with llm.time_budget(seconds, reserve=seconds * reply_share):
        return engine_call(*args)


def _recording_url():
    url = settings.DEMO_RECORDING_URL
    return url if url.startswith("https://") else ""


# --- Kill switch -------------------------------------------------------------
OFFLINE_MESSAGE = "The demo is temporarily offline."


def _offline_page(request):
    return render(request, "core/demo_offline.html",
                  {"recording_url": _recording_url()}, status=503)


def _demo_api(view):
    """While the demo is switched off, API calls get a 503 the cockpit recognises."""
    @wraps(view)
    def guarded(request, *args, **kwargs):
        if not settings.DEMO_ENABLED:
            return JsonResponse({"error": OFFLINE_MESSAGE, "offline": True}, status=503)
        return view(request, *args, **kwargs)
    return guarded


# --- Page --------------------------------------------------------------------
def console(request):
    """The cockpit page itself."""
    if not settings.DEMO_ENABLED:
        return _offline_page(request)
    return _live_console(request)


@_uses_store                               # cookie + seeded roster ready before first paint
def _live_console(request):
    return render(request, "core/mindform_console.html",
                  {"recording_url": _recording_url()})


# --- JSON API (mirrors web/server.py routes, mounted under /demo/api) --------
@require_GET
@_demo_api
@_uses_store
def api_config(request):
    return _run(bridge.ui_config)


@require_GET
@_demo_api
@_uses_store
def api_characters(request):
    return _run(lambda: {"characters": bridge.roster()})


@require_GET
@_demo_api
@_uses_store
def api_state(request):
    name = (request.GET.get("name") or "").strip()
    if not name:
        return JsonResponse({"error": "name is required"}, status=400)
    return _run(lambda: bridge.load_snapshot(name))


@csrf_exempt
@require_POST
@_demo_api
@_uses_store
def api_select(request):
    name = (_json_body(request).get("name") or "").strip()
    if not name:
        return JsonResponse({"error": "name is required"}, status=400)
    return _run(lambda: bridge.load_snapshot(name))


@csrf_exempt
@require_POST
@_demo_api
@_uses_store
def api_turn(request):
    body = _json_body(request)
    name = (body.get("name") or "").strip()
    message = (body.get("message") or "").strip()
    if not name or not message:
        return JsonResponse({"error": "name and message are required"}, status=400)
    return _run(lambda: _within_budget(bridge.run_turn, name, message, reply_share=REPLY_SHARE))


@csrf_exempt
@require_POST
@_demo_api
@_uses_store
def api_create_genesis(request):
    bio = (_json_body(request).get("bio") or "").strip()
    if not bio:
        return JsonResponse({"error": "a biography is required"}, status=400)
    return _run(lambda: _within_budget(bridge.create_genesis, bio))


@csrf_exempt
@require_POST
@_demo_api
@_uses_store
def api_create_manual(request):
    body = _json_body(request)
    identity = body.get("identity") or {}
    if not (identity.get("name") or "").strip():
        return JsonResponse({"error": "a name is required"}, status=400)
    return _run(lambda: bridge.create_manual(identity, body.get("levels") or {}))


# --- Health check (staff only) -------------------------------------------------
def _storage_check():
    try:
        os.makedirs(_DATA_HOME, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=_DATA_HOME, prefix=".health-"):
            pass
        return "ok"
    except OSError as exc:
        return f"error: {exc}"


def _turn_check():
    """One real turn with a throwaway character, under the visitors' time budget: shows which
    steps the live model answered and which fell back offline, and how long it all took."""
    root = tempfile.mkdtemp(prefix=".health-", dir=_DATA_HOME)
    started = time.monotonic()
    try:
        personality.set_data_root(root)
        identity, levels = _SEED_CHARACTERS[0]
        bridge.create_manual(identity, levels)
        snap = _within_budget(bridge.run_turn, identity["name"], "I finally finished a project "
                              "I had been dreading for weeks.", reply_share=REPLY_SHARE)
        return {
            "seconds": round(time.monotonic() - started, 1),
            "reply_from": (snap.get("expression") or {}).get("source"),
            "appraisal_from": snap.get("appraisal_source"),
            "traits_push_from": snap.get("source"),
            "reply": (snap.get("reply") or "")[:200],
        }
    except Exception as exc:
        log.exception("demo health check turn failed")
        return {"seconds": round(time.monotonic() - started, 1),
                "error": f"{type(exc).__name__}: {exc}"[:300]}
    finally:
        shutil.rmtree(root, ignore_errors=True)


@require_GET
def health(request):
    """What the live demo is running on, checked live. Staff only: sign in at /admin/ first.

    "rule", "offline" and "heuristic" in the turn's sources mean those steps fell back
    because the model failed or ran out of time; the model check's error says why.
    """
    try:
        allowed = request.user.is_active and request.user.is_staff
    except Exception:                      # no database means no sign-in either
        allowed = False
    if not allowed:
        raise Http404
    report = {
        "demo_enabled": settings.DEMO_ENABLED,
        "turn_budget_seconds": settings.DEMO_TURN_BUDGET_SECONDS,
        "storage": _storage_check(),
        "model": llm.health_check(),
    }
    if report["storage"] == "ok":
        report["turn"] = _turn_check()
    response = JsonResponse(report, json_dumps_params={"indent": 2})
    add_never_cache_headers(response)
    return response
