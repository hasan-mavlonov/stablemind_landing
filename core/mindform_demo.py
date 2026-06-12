"""MindForm demo — the personality-engine cockpit, served inside the Django site.

The browser cockpit (templates/core/mindform_console.html + static/mindform/*) is
the unchanged MindForm Console front-end. These views replace the demo's original
stdlib ``http.server`` (web/server.py): they expose the same JSON API, but route it
through Django and back the engine with a *per-visitor* character store so two
people talking to the demo never collide.

The engine itself (core/mindform_engine/) is vendored from the mindform_v0 repo and
runs on the Python standard library alone — heuristic appraisal, a heuristic trait
"push", and a rule-based in-character reply. With a GEMINI_API_KEY in the
environment it transparently upgrades to LLM-quality pushes and replies; without
one (the default here) everything still works offline.
"""

import json
import logging
import os

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .mindform_engine import bridge, personality

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


# --- Per-session store -------------------------------------------------------
def _session_data_root(request):
    """An isolated character-store directory for this browser session."""
    if not request.session.session_key:
        request.session.create()          # also marks the session modified -> cookie sent
    return os.path.join(_DATA_HOME, request.session.session_key)


def _seed_if_empty():
    """Populate a brand-new (empty) store with the starter characters."""
    if personality.list_characters():
        return
    for identity, levels in _SEED_CHARACTERS:
        try:
            bridge.create_manual(identity, levels)
        except Exception:                 # a bad seed must never break the demo
            log.exception("seeding starter character %s failed", identity.get("name"))


def _activate_store(request):
    """Bind the engine to this visitor's store for the duration of the request."""
    personality.set_data_root(_session_data_root(request))
    _seed_if_empty()


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
    except Exception as exc:               # never leak a stack trace to the browser
        log.exception("mindform demo API error")
        return JsonResponse({"error": str(exc)}, status=500)


# --- Page --------------------------------------------------------------------
def console(request):
    """The cockpit page itself."""
    _activate_store(request)               # ensure a session + seeded roster before first paint
    return render(request, "core/mindform_console.html")


# --- JSON API (mirrors web/server.py routes, mounted under /demo/api) --------
@require_GET
def api_config(request):
    _activate_store(request)
    return _run(bridge.ui_config)


@require_GET
def api_characters(request):
    _activate_store(request)
    return _run(lambda: {"characters": bridge.roster()})


@require_GET
def api_state(request):
    _activate_store(request)
    name = (request.GET.get("name") or "").strip()
    if not name:
        return JsonResponse({"error": "name is required"}, status=400)
    return _run(lambda: bridge.load_snapshot(name))


@csrf_exempt
@require_POST
def api_select(request):
    _activate_store(request)
    name = (_json_body(request).get("name") or "").strip()
    if not name:
        return JsonResponse({"error": "name is required"}, status=400)
    return _run(lambda: bridge.load_snapshot(name))


@csrf_exempt
@require_POST
def api_turn(request):
    _activate_store(request)
    body = _json_body(request)
    name = (body.get("name") or "").strip()
    message = (body.get("message") or "").strip()
    if not name or not message:
        return JsonResponse({"error": "name and message are required"}, status=400)
    return _run(lambda: bridge.run_turn(name, message))


@csrf_exempt
@require_POST
def api_create_genesis(request):
    _activate_store(request)
    bio = (_json_body(request).get("bio") or "").strip()
    if not bio:
        return JsonResponse({"error": "a biography is required"}, status=400)
    return _run(lambda: bridge.create_genesis(bio))


@csrf_exempt
@require_POST
def api_create_manual(request):
    _activate_store(request)
    body = _json_body(request)
    identity = body.get("identity") or {}
    if not (identity.get("name") or "").strip():
        return JsonResponse({"error": "a name is required"}, status=400)
    return _run(lambda: bridge.create_manual(identity, body.get("levels") or {}))
