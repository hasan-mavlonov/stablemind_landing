"""``{% asset 'path.js' %}``: a static URL that changes whenever the file does.

Static files keep their plain names (no manifest), and browsers and Cloudflare may cache them
for hours, so after a deploy visitors could run yesterday's JavaScript against today's pages.
A ``?v=`` fingerprint of the file's contents gives every changed file a new URL. A file that
can't be found just gets its plain URL: the page still renders.
"""

import hashlib
from functools import lru_cache

from django import template
from django.conf import settings
from django.contrib.staticfiles import finders
from django.templatetags.static import static

register = template.Library()


def _fingerprint(path):
    found = finders.find(path)
    if not found:
        return ""
    try:
        with open(found, "rb") as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:10]
    except OSError:
        return ""


_cached_fingerprint = lru_cache(maxsize=128)(_fingerprint)


@register.simple_tag
def asset(path):
    version = _fingerprint(path) if settings.DEBUG else _cached_fingerprint(path)
    url = static(path)
    return f"{url}?v={version}" if version else url
