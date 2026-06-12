"""Persistent personality state: identity, temperament, and the five OCEAN traits.

A character is *born* via genesis/creation (temperament.py): identity facts plus a
per-trait OCEAN baseline ``mu`` and stickiness ``tau``; the current traits start AT
the baseline (x = mu). Experiences then push the traits with diminishing returns
(updater.py). State persists as JSON.

Two stores live here:
  * a single default character -> data/personality.json         (simulation.py demo)
  * a named-character roster    -> data/characters/<slug>.json   (interactive shell)
"""

import contextvars
import json
import os
import re

from .config import BASIS, BASIS_NAMES, DEFAULT_TAU, VALUES
from .character import default_character

# Data root is request-scoped so each visitor (Django session) gets an isolated
# character store. The Django demo sets it per request via ``set_data_root``;
# standalone/CLI use keeps the original ``data/`` default. A ContextVar is safe
# under threaded servers -- each request context carries its own value.
_DATA_ROOT = contextvars.ContextVar("mindform_data_root", default="data")


def set_data_root(path):
    """Point the character store at ``path`` for the current execution context."""
    _DATA_ROOT.set(str(path))


def _data_root():
    return _DATA_ROOT.get()


def _personality_file():
    return os.path.join(_data_root(), "personality.json")


def _characters_dir():
    return os.path.join(_data_root(), "characters")


def default_temperament():
    """Neutral baseline: every trait set-point at 0, default stickiness."""
    return {
        "mu": {d: 0.0 for d in BASIS},
        "tau": {d: DEFAULT_TAU for d in BASIS},
    }


def default_personality():
    """A blank character: born at a neutral temperament (traits start at mu = 0)."""
    return {
        "identity": {},
        "temperament": default_temperament(),
        "traits": {d: 0.0 for d in BASIS},
        "character": default_character(),
        "experience_count": 0,
    }


def _ensure_temperament(personality):
    """Backfill identity + temperament onto a pre-temperament save (mu = traits)."""
    if "identity" not in personality:
        personality["identity"] = {}
    if "temperament" not in personality:
        traits = personality.get("traits", {})
        personality["temperament"] = {
            "mu": {d: traits.get(d, 0.0) for d in BASIS},
            "tau": {d: DEFAULT_TAU for d in BASIS},
        }
    return personality


def _ensure_character(personality):
    """Backfill the character (Schwartz values + habits) onto a pre-character save."""
    character = personality.get("character")
    if not isinstance(character, dict):
        personality["character"] = default_character()
    else:
        character.setdefault("habits", [])
        values = character.setdefault("values", {})
        for v in VALUES:                      # seed any missing value at neutral
            values.setdefault(v, 0.0)
    return personality


def migrate(data):
    """Upgrade legacy formats and backfill temperament. Pure -- the caller persists."""
    if "traits" in data:                     # current shape (maybe pre-temperament)
        personality = data
    elif "dims" in data:                     # two-timescale struct -> trait only
        personality = default_personality()
        for key, dim in data["dims"].items():
            if key in personality["traits"]:
                personality["traits"][key] = dim.get("trait", 0.0)
    else:                                    # original flat {long_name: value}
        personality = default_personality()
        name_to_key = {v: k for k, v in BASIS_NAMES.items()}
        for name, value in data.items():
            key = name_to_key.get(name)
            if key is not None:
                personality["traits"][key] = value
    return _ensure_character(_ensure_temperament(personality))


def _read(path):
    with open(path, "r") as f:
        return migrate(json.load(f))


def _write(path, personality):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(personality, f, indent=4)


# --- Single default character (data/personality.json) ----------------------
def load_personality():
    if not os.path.exists(_personality_file()):
        personality = default_personality()
        save_personality(personality)
        return personality
    return _read(_personality_file())


def save_personality(personality):
    _write(_personality_file(), personality)


# --- Named-character roster (data/characters/<slug>.json) -------------------
def _slug(name):
    slug = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")
    return slug or "unnamed"


def character_path(name):
    return os.path.join(_characters_dir(), _slug(name) + ".json")


def save_character(personality):
    """Save a character to the roster, keyed by its identity name. Returns the path."""
    name = (personality.get("identity") or {}).get("name")
    path = character_path(name)
    _write(path, personality)
    return path


def load_character(name):
    return _read(character_path(name))


def list_characters():
    """Every saved character (migrated), sorted by file name."""
    characters_dir = _characters_dir()
    if not os.path.isdir(characters_dir):
        return []
    characters = []
    for filename in sorted(os.listdir(characters_dir)):
        if filename.endswith(".json") and not filename.endswith(".memories.json"):
            characters.append(_read(os.path.join(characters_dir, filename)))
    return characters


def read_traits(personality):
    """Human-readable read-out: {long_name: value}."""
    return {BASIS_NAMES[d]: v for d, v in personality["traits"].items()}


def read_temperament(personality):
    """Human-readable temperament: {long_name: {"mu": baseline, "tau": stickiness}}."""
    temp = personality["temperament"]
    return {BASIS_NAMES[d]: {"mu": temp["mu"][d], "tau": temp["tau"][d]} for d in BASIS}
