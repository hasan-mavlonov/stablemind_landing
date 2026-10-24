"""Site content that lives in content/*.json instead of in templates or the React bundle.

Edit the JSON to change what the site says; no code change and no `npm run build` needed.

* A value that is empty or starts with "TODO" counts as unknown and is never shown, so a
  gap can stay in the file, marked, without leaking onto the page.
* A missing or malformed file never breaks a page. It is logged and treated as empty,
  which hides that section or shows its empty state. The test suite loads every shipped
  file with ``strict=True``, so a typo fails the tests instead of quietly emptying a section.
* Logos and photos are file names inside core/static/core/img/<folder>/. One that isn't
  there falls back to a text label or initials: the page never shows an image we don't have.
  A recognition card can also name the licensed NVIDIA Inception badge as "nvidia-inception",
  which points at the one official file (never copy it).
* Links must be http(s) or mailto; anything else is dropped.
"""

import json
import logging
import re
from pathlib import Path

from django.conf import settings
from django.contrib.staticfiles import finders
from django.templatetags.static import static

log = logging.getLogger(__name__)

CONTENT_DIR = Path(settings.BASE_DIR) / "content"
IMAGE_ROOT = "core/img"
# NVIDIA's artwork, used as-is under our trademark license (a test pins its hash).
NVIDIA_BADGE = "core/img/nvidia/nvidia-inception-program-badge-rgb-for-screen.svg"
# How a card shows its image: "cover" fills the frame (banners), "contain" shows all of it
# and opens full size on click (certificates, letters), "badge" is small and centred.
IMAGE_FITS = ("cover", "contain", "badge")

# One schema per file: which fields are required, which are optional, and where its images
# live. Field values are strings unless listed in `numbers` (shown as written).
SCHEMAS = {
    "recognition": {
        "required": ("title", "status"),
        "optional": ("org", "year", "logo", "logo_fit", "logo_alt", "link", "description"),
        "images": {"logo": "recognition"},
        # Names that stand for a shared file instead of one in the folder.
        "reserved_images": {"logo": {"nvidia-inception": NVIDIA_BADGE}},
        "fits": {"logo": "logo_fit"},
    },
    "partners": {
        "required": ("name", "type"),
        "optional": ("logo", "link", "blurb"),
        "images": {"logo": "partners"},
        "choices": {"type": ("research", "industry", "pilot")},
    },
    "milestones": {
        "required": ("title",),
        "optional": ("date", "date_end", "detail", "link"),
        "dates": ("date", "date_end"),
    },
    "benchmarks": {
        "required": ("benchmark", "metric", "mindform_score"),
        "optional": ("baseline", "date", "link"),
        "numbers": ("mindform_score", "baseline"),
        "dates": ("date",),
    },
    "press": {
        "required": ("outlet", "title"),
        "optional": ("date", "link"),
        "dates": ("date",),
    },
    "advisors": {
        "required": ("name",),
        "optional": ("role", "affiliation", "link", "photo"),
        "images": {"photo": "team"},
    },
    "team": {
        "required": ("name", "role"),
        "optional": ("link", "photo"),
        "images": {"photo": "team"},
    },
}

_DATE = re.compile(r"^(\d{4})(?:-(0[1-9]|1[0-2]))?$")
# The marker "TODO" (any case) at the start, as a whole word: "TODO", "todo: year", but not
# names like "Todoist".
_TODO = re.compile(r"^todo(?![a-z0-9])", re.IGNORECASE)
_MONTHS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


class ContentError(ValueError):
    """A content file breaks its schema (raised only with strict=True)."""


def known(value):
    """The value as display text, or "" when it is empty or still marked TODO."""
    if value is None:
        return ""
    text = str(value).strip()
    return "" if not text or _TODO.match(text) else text


def format_date(start, end=""):
    """'2026-06' -> 'Jun 2026'; a range -> 'Aug to Oct 2026'. Unknown dates give ''."""
    start, end = known(start), known(end)
    if not start:
        return ""

    def parts(value):
        year, month = _DATE.match(value).groups()
        return year, _MONTHS[int(month) - 1] if month else ""

    year, month = parts(start)
    label = f"{month} {year}".strip()
    if not end:
        return label
    end_year, end_month = parts(end)
    if end_year == year and month and end_month:
        return f"{month} to {end_month} {year}"
    return f"{label} to {end_month} {end_year}".strip()


def _problem(name, index, message, strict):
    text = f"content/{name}.json item {index}: {message}"
    if strict:
        raise ContentError(text)
    log.warning("%s (skipped)", text)


def _clean_item(name, index, item, schema, strict):
    """A validated copy of one item with display-ready values, or None to skip it."""
    if not isinstance(item, dict):
        _problem(name, index, "is not an object", strict)
        return None
    allowed = set(schema["required"]) | set(schema["optional"])
    for key in item:
        if key not in allowed:    # most likely a typo, which would silently drop a value
            _problem(name, index, f"unknown field {key!r} (allowed: {', '.join(sorted(allowed))})", strict)

    clean = {}
    for key in allowed:
        raw = item.get(key)
        if raw is not None and not isinstance(raw, str):
            if key in schema.get("numbers", ()) and isinstance(raw, (int, float)) and not isinstance(raw, bool):
                raw = str(raw)
            else:
                _problem(name, index, f"{key!r} must be text", strict)
                raw = None
        clean[key] = known(raw)

    for key in schema["required"]:
        if not clean[key]:
            _problem(name, index, f"required field {key!r} is missing or TODO", strict)
            return None

    for key, options in schema.get("choices", {}).items():
        if clean[key] and clean[key] not in options:
            _problem(name, index, f"{key!r} must be one of {', '.join(options)}", strict)
            return None

    for key in schema.get("dates", ()):
        if clean[key] and not _DATE.match(clean[key]):
            _problem(name, index, f"{key!r} must look like 2026 or 2026-06", strict)
            clean[key] = ""

    if clean.get("link") and not clean["link"].startswith(("https://", "http://", "mailto:")):
        _problem(name, index, "link must start with https://, http:// or mailto:", strict)
        clean["link"] = ""

    for key, folder in schema.get("images", {}).items():
        filename = clean[key]
        fit_key = schema.get("fits", {}).get(key)
        if fit_key and clean[fit_key] and clean[fit_key] not in IMAGE_FITS:
            _problem(name, index, f"{fit_key!r} must be one of {', '.join(IMAGE_FITS)}", strict)
            clean[fit_key] = ""
        if not filename:
            continue
        reserved = schema.get("reserved_images", {}).get(key, {})
        if filename in reserved:
            clean[key] = static(reserved[filename])
            if fit_key:
                clean[fit_key] = "badge"
            continue
        path = f"{IMAGE_ROOT}/{folder}/{filename}"
        if "/" in filename or "\\" in filename or not finders.find(path):
            _problem(name, index, f"{key} file {path} not found; showing a text label instead", strict)
            clean[key] = ""
        else:
            clean[key] = static(path)
            if fit_key and not clean[fit_key]:
                clean[fit_key] = "contain"
    return clean


def load(name, *, strict=False):
    """The items of content/<name>.json, validated and ready to display."""
    schema = SCHEMAS[name]
    path = CONTENT_DIR / f"{name}.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        if strict:
            raise ContentError(f"content/{name}.json is missing")
        log.warning("content/%s.json is missing; treating it as empty", name)
        return []
    except (OSError, ValueError) as exc:
        if strict:
            raise ContentError(f"content/{name}.json is not valid JSON: {exc}")
        log.error("content/%s.json is not valid JSON (%s); treating it as empty", name, exc)
        return []
    if not isinstance(data, list):
        if strict:
            raise ContentError(f"content/{name}.json must be a list")
        log.error("content/%s.json must be a list; treating it as empty", name)
        return []

    items = [_clean_item(name, i, item, schema, strict) for i, item in enumerate(data)]
    items = [item for item in items if item]
    if "date" in schema.get("dates", ()):
        for item in items:
            item["date_label"] = format_date(item["date"], item.get("date_end", ""))
    return items
