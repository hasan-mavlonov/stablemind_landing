# mindform_landing

## Run locally

1. `git pull` to get the latest code. Merging a PR on GitHub doesn't update the copy on your
   computer.
2. In `.env`, set `DEBUG=True`. With it off, Django redirects to HTTPS, which the local server
   can't serve, so `http://127.0.0.1:8000` won't load.
3. `python manage.py runserver`, then open http://127.0.0.1:8000. Restart it after pulling.

`npm run build` only rebuilds `core/static/core/js/landing.bundle.js` from
`frontend/src/landing.jsx`. Run it after editing that file. It doesn't download code or restart
the server, and the built bundle is committed, so a fresh pull already includes it.

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
- **One per page.** Exhibit B forbids using several NVIDIA logos without NVIDIA's written
  permission. We read that as one badge per page.
- **Wording.** "Member of NVIDIA Inception" is accurate. Never write "Backed by", "Powered by",
  "Partner" or anything else that implies NVIDIA endorses, provides or supervises our product.
- **Credit line.** Pages with the badge carry: "NVIDIA, the NVIDIA logo and NVIDIA Inception are
  trademarks and/or registered trademarks of NVIDIA Corporation in the U.S. and other countries."
- **Samples.** NVIDIA may ask to review materials that use the badge before they go out.

The badge appears in the landing hero's proof row, directly under the call-to-action buttons
and labelled "Member of", inside the first screen on common laptops (`frontend/src/landing.jsx`;
rebuild with `npm run build`). It also appears in the shared footer
(`core/templates/core/base.html`). `python manage.py test core` checks the file hash, one badge
per page, the credit line and the wording.
