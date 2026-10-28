# mindform_landing

## Run locally

1. `git pull` to get the latest code. Merging a PR on GitHub doesn't update the copy on your
   computer.
2. `python manage.py runserver`, then open http://127.0.0.1:8000. Restart it after pulling.
   The dev server always answers on localhost over plain HTTP, even with a `.env` copied from
   production. Set `DEBUG=True` in `.env` to see error details while developing.
3. For the live demo to use Gemini, put `GEMINI_API_KEY` in `.env`. Without it every reply
   comes from the offline engine.

`npm run build` only rebuilds `core/static/core/js/landing.bundle.js` from
`frontend/src/landing.jsx`. Run it after editing that file. It doesn't download code or restart
the server, and the built bundle is committed, so a fresh pull already includes it.

## Settings (environment variables)

| Variable | Default | What it does |
| --- | --- | --- |
| `DEBUG` | off | Local development only. Ignored when `ALLOWED_HOSTS` names a public host. |
| `SECRET_KEY` | insecure placeholder | Must be set in production; a warning is logged when it isn't. |
| `ALLOWED_HOSTS` | mindform-ai.com, www, localhost | Comma-separated. Render's own hostname is added automatically. |
| `CSRF_TRUSTED_ORIGINS` | https://mindform-ai.com, https://www | Comma-separated. |
| `SECURE_HSTS_SECONDS` | 3600 | Raise to 31536000 once HTTPS is confirmed everywhere, then consider `SECURE_HSTS_INCLUDE_SUBDOMAINS` and `SECURE_HSTS_PRELOAD`. |
| `DEMO_ENABLED` | on | `false` shows "Demo temporarily offline" on /demo/ instead of running the engine. |
| `DEMO_RECORDING_URL` | empty | Where "Watch the recording" points on the offline card. Hidden while empty. |
| `DEMO_TURN_BUDGET_SECONDS` | 25 | Total LLM time per demo request before the engine answers offline. Keep it under half of Cloudflare's 100s timeout. |
| `GEMINI_API_KEY` | empty | The live demo's model key (Google AI Studio). Without it every step answers offline. `LLM_MODEL` picks the model (default `gemini-3.1-flash-lite`). |
| `RESUME_STORAGE_LIMIT_MB` | 200 | Total size of CVs kept in the database. Past it, the careers form asks people to email their CV. |
| `CONTACT_EMAIL` | hasan@mindform-ai.com | Footer contact on every page, and every "Contact us", "Join" and waitlist link. |
| `PARTNERS_EMAIL` | same as `CONTACT_EMAIL` | Shown in Partners & collaborators while the list is empty. |
| `LINKEDIN_URL` | empty | Company LinkedIn page (https only). Hidden while empty. |
| `WECHAT_ID` | empty | Shown as "WeChat: <id>" in the footer. Hidden while empty. |

## Is the live demo healthy?

Sign in at `/admin/` with a staff account, then open `/demo/health/`. It checks, live:

- `model`: one small call to the configured model. `status: ok`, or the exact error (wrong
  key, retired model name, quota used up...).
- `turn`: a real demo turn with a throwaway character, and where each part came from. `llm`
  means the model answered; `rule`, `offline` or `heuristic` mean that step fell back to the
  built-in engine because the model failed or ran out of time.

Visitors get a 404 there. Every fallback is also logged (search the Render logs for
`unavailable`), and each request is logged with its status and time in milliseconds.

The demo keeps each visitor's characters on the server's disk under a signed cookie and never
touches the database, so it keeps working if the database is paused or unreachable.

## Careers applications

Applications and their CVs are stored in the database (Render's disk is wiped on every deploy
and restart). In `/admin/`, open Applications: the CV column downloads each file.

## Running in production

Render runs the start command from its dashboard and ignores the `Procfile`. Gunicorn reads
`gunicorn.conf.py` (2 workers x 4 threads, one log line per request) whenever it starts from
this folder, so a plain `gunicorn stablemind.wsgi:application` gets the right settings.

## Site content

Recognition, partners, press, team, advisors, milestones and benchmarks are JSON files in
`content/`. Editing them needs no rebuild. See [content/README.md](content/README.md) for the
fields and rules (unknown values stay as `TODO` and are never shown).

## NVIDIA Inception badge

Mindform is a member of the NVIDIA Inception Program. We display the badge under a signed NVIDIA
Trademark License, and its Exhibit B sets the rules below. If NVIDIA flags a misuse and it isn't
fixed within 15 days, the license ends, so treat these as hard requirements.

- **Official file only.** `core/static/core/img/nvidia/nvidia-inception-program-badge-rgb-for-screen.svg`
  is NVIDIA's artwork, byte for byte (a test pins its hash). Never recolor, crop or stretch it, and
  never put a CSS `filter`, `opacity` or blend mode on it. NVIDIA designed it for both light and
  dark backgrounds, so dark mode needs no special treatment.
- **Size.** The visible badge must be at least 30px tall. The SVG has a built-in transparent
  margin, so the `<img>` itself needs to be at least 40px tall. It must never be bigger than the
  Mindform wordmark it appears with.
- **Clear space.** Keep other text and graphics at least one NVIDIA-eye height away (about 40% of
  the visible badge height), following the Exhibit B diagram.
- **Only the Inception badge.** Exhibit B: "multiple NVIDIA logos may not be used by licensees
  unless express permission has been granted by NVIDIA in writing or through current
  guidelines." We read that as: use the Inception badge, never other NVIDIA marks. The homepage
  shows the badge twice (hero and the Recognition card); other pages show it once, in the footer.
  For the strictest reading (one badge per page), delete the NVIDIA card's `"logo"` line in
  `content/recognition.json`.
- **Wording.** "Member of NVIDIA Inception" is accurate. Never write "Backed by", "Powered by",
  "Partner" or anything else that implies NVIDIA endorses, provides or supervises our product.
- **Credit line.** Pages with the badge carry: "NVIDIA, the NVIDIA logo and NVIDIA Inception are
  trademarks and/or registered trademarks of NVIDIA Corporation in the U.S. and other countries."
- **Samples.** NVIDIA may ask to review materials that use the badge before they go out.

The badge appears in the landing hero's proof row, directly under the call-to-action buttons
and labelled "Member of", inside the first screen on common laptops (`frontend/src/landing.jsx`;
rebuild with `npm run build`), and in the NVIDIA card of the Recognition section. It also appears
in the shared footer (`core/templates/core/base.html`). `python manage.py test core` checks the
file hash, one badge on the footer pages, that no CSS filter touches it, the credit line and the
wording.
