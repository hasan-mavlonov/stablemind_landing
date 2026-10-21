import logging
import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

log = logging.getLogger("stablemind.settings")

# -----------------------
# Base setup
# -----------------------
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv()

# -----------------------
# Core security settings
# -----------------------
INSECURE_DEFAULT_SECRET_KEY = "django-insecure-CHANGE-ME"
SECRET_KEY = os.getenv("SECRET_KEY", INSECURE_DEFAULT_SECRET_KEY)


def _csv_env(name: str, default: str = ""):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def _env_bool(name: str, default: bool = False) -> bool:
    raw = (os.getenv(name) or "").strip().lower()
    if not raw:
        return default
    return raw in {"1", "true", "yes", "on"}


def _env_number(name: str, default, cast=int):
    """A numeric setting. Empty or invalid values fall back to the default instead of
    stopping every worker from booting (a bare `KEY=` line in .env is easy to leave)."""
    raw = (os.getenv(name) or "").strip()
    if not raw:
        return default
    try:
        return cast(raw)
    except ValueError:
        log.warning("%s=%r is not a number; using %s", name, raw, default)
        return default


# The public site and the hosts a local dev server answers on.
PRODUCTION_HOSTS = ["mindform-ai.com", "www.mindform-ai.com"]
LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

# DEBUG comes from the environment and is off unless explicitly turned on.
DEBUG = _env_bool("DEBUG", False)

_hosts_from_env = _csv_env("ALLOWED_HOSTS")
ALLOWED_HOSTS = list(_hosts_from_env or LOCAL_HOSTS)
# Render publishes the service's own hostname; its health checks and the onrender.com URL use it.
_render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME", "").strip()
if _render_host and _render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)

# Never serve debug pages on a public host: with DEBUG on, any 404 prints the full URL map
# (admin/, media/resumes/...) and any 500 prints settings and stack frames. A stray
# DEBUG=True in the production environment is ignored instead of leaking that.
_public_hosts = [h for h in ALLOWED_HOSTS if h.lstrip(".") not in {"localhost", "127.0.0.1", "[::1]"}]
if DEBUG and _public_hosts:
    log.warning("DEBUG=True ignored because ALLOWED_HOSTS includes public hosts: %s", ", ".join(_public_hosts))
    DEBUG = False

# Without an explicit list, production answers on the public domain. Decided after the guard
# above, so a stray DEBUG=True can never leave mindform-ai.com out of the list.
if not DEBUG and not _hosts_from_env:
    ALLOWED_HOSTS += [h for h in PRODUCTION_HOSTS if h not in ALLOWED_HOSTS]

if not DEBUG and "*" in ALLOWED_HOSTS:
    log.warning("ALLOWED_HOSTS='*' replaced with the production hosts; list hosts explicitly instead.")
    ALLOWED_HOSTS = [h for h in ALLOWED_HOSTS if h != "*"] + [h for h in PRODUCTION_HOSTS if h not in ALLOWED_HOSTS]

CSRF_TRUSTED_ORIGINS = _csv_env("CSRF_TRUSTED_ORIGINS") or (
    [] if DEBUG else [f"https://{host}" for host in PRODUCTION_HOSTS]
)

if not DEBUG and SECRET_KEY == INSECURE_DEFAULT_SECRET_KEY:
    log.warning("SECRET_KEY is not set: sessions and CSRF tokens are signed with a public default key.")

# -----------------------
# Supabase config (storage)
# -----------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# -----------------------
# Database (Neon / Supabase Postgres)
# -----------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }

    DATABASES["default"]["OPTIONS"] = {
        "sslmode": "require"
    }

else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# -----------------------
# Installed apps
# -----------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "core",
]

# -----------------------
# Middleware
# -----------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "stablemind.urls"

# -----------------------
# Templates
# -----------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "stablemind.wsgi.application"

# -----------------------
# Password validation
# -----------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -----------------------
# Internationalization
# -----------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -----------------------
# Static files (Render + Whitenoise)
# -----------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "core/static"]

STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

# -----------------------
# Media (NOT used for Supabase resumes anymore)
# -----------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
import os

if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)
# -----------------------
# Production security
# -----------------------
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = _env_bool("SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # HSTS makes browsers refuse plain HTTP for max-age seconds and can't be taken back
    # early, so it starts at one hour. Once HTTPS is confirmed on every subdomain, raise it
    # via the environment (e.g. 31536000, then INCLUDE_SUBDOMAINS, then PRELOAD).
    SECURE_HSTS_SECONDS = _env_number("SECURE_HSTS_SECONDS", 3600)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = _env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
    SECURE_HSTS_PRELOAD = _env_bool("SECURE_HSTS_PRELOAD", False)

LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# -----------------------
# Site content
# -----------------------
# Shown in the Partners & Collaborators section until content/partners.json has entries.
PARTNERS_EMAIL = os.getenv("PARTNERS_EMAIL", "partners@mindform-ai.com").strip()

# -----------------------
# MindForm demo (/demo/)
# -----------------------
# Kill switch: DEMO_ENABLED=False serves a friendly "Demo temporarily offline" page (and
# 503s from the demo API) instead of running the engine.
DEMO_ENABLED = _env_bool("DEMO_ENABLED", True)
# Where "Watch the recording" points while the demo is offline. Empty hides that link.
DEMO_RECORDING_URL = os.getenv("DEMO_RECORDING_URL", "").strip()
# Total seconds all LLM calls in one demo request may take together; past it the engine
# answers with its offline heuristics instead of waiting. Each call's timeout is cut to what
# is left, but an HTTP timeout restarts whenever bytes arrive, so a server that trickles its
# answer can hold one call open longer. Cloudflare's 100s limit, and the console's offline
# card, are the backstop: keep this well under it.
DEMO_TURN_BUDGET_SECONDS = _env_number("DEMO_TURN_BUDGET_SECONDS", 25.0, float)

# -----------------------
# Logging
# -----------------------
# The MindForm engine logs every LLM-fallback (bad/missing key, wrong model, network
# error) at INFO under the "mindform" logger tree, but Django/gunicorn don't configure
# a handler for it by default, so those messages -- the exact reason the demo drops to
# its offline voice -- were silently dropped instead of reaching the platform's log
# viewer. Wire "mindform" to the console explicitly so they show up.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    # Warnings and errors from anything else (this settings file included) go to the console.
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        # Django's own console handler only prints while DEBUG is on, and with no ADMINS its
        # error e-mails go nowhere, so with DEBUG off a 500's traceback would never reach the
        # platform's logs. Send Django's records to the console directly instead.
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "mindform": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}