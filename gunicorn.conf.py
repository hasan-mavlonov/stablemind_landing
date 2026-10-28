"""Gunicorn settings, read automatically when gunicorn starts in this folder.

Render starts the app with the command set in its dashboard and ignores the Procfile, so
these keep production the same whatever that command is. Flags on the command line win.
"""
import os

# Two processes with four threads each, so a demo turn waiting on the LLM (up to
# DEMO_TURN_BUDGET_SECONDS) doesn't hold up everyone else, as gunicorn's default of one
# synchronous worker would. About 220 MB in total, within a 512 MB instance.
workers = int(os.getenv("WEB_CONCURRENCY") or 2)
worker_class = "gthread"
threads = 4
# Far above the demo's 25s turn budget and Cloudflare's 100s limit for a response.
timeout = 120
graceful_timeout = 30
keepalive = 5

# One line per request in the platform's logs, with the time it took: a slow or failing
# demo endpoint shows up there without any other tooling.
accesslog = "-"
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(M)sms'
