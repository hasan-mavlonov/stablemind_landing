# Site content

The lists on the site live in these JSON files, not in the templates or the React bundle.
Edit a file, deploy, and the page updates. No `npm run build` needed.

| File | Shown in | Fields (* = required) | When empty |
| --- | --- | --- | --- |
| `recognition.json` | Homepage, Recognition | title\*, status\*, org, year, logo, link, description | Section hidden |
| `partners.json` | Homepage, Partners & collaborators | name\*, type\* (`research`, `industry` or `pilot`), logo, link, blurb | "We're onboarding our first design partners..." with `PARTNERS_EMAIL` |
| `press.json` | Homepage, Press | outlet\*, title\*, date, link | Section hidden |
| `team.json` | Homepage, Team | name\*, role\*, link, photo | |
| `advisors.json` | Homepage, under Team | name\*, role, affiliation, link, photo | Block hidden |
| `milestones.json` | Research page | title\*, date, date_end, detail, link | Block hidden |
| `benchmarks.json` | Research page | benchmark\*, metric\*, mindform_score\*, baseline, date, link | "Benchmark results coming soon." |

Rules the loader (`core/content.py`) applies:

- **TODO means unknown.** Any value that is empty or starts with `TODO` is never shown, so you
  can leave `"year": "TODO"` in a file until you know it. `grep -rn TODO content/` lists the gaps.
- **Dates** are `2026` or `2026-06`. A milestone with `date_end` shows as a range ("Aug to Oct
  2026"). Dated milestones are sorted by date; undated ones are listed separately.
- **Links** must start with `https://`, `http://` or `mailto:`.
- **Status pills** take their colour from the first word of `status` (`Member`, `Semifinalist`,
  `Accepted`). Text after ` · ` stays in the pill, e.g. `Accepted · offer declined`.
- **Logos and photos** are file names only. Put recognition images in
  `core/static/core/img/recognition/`, partner logos in `core/static/core/img/partners/` and
  photos in `core/static/core/img/team/`. If the file isn't there, the card shows the name as text
  (logos) or no photo. Images are shown exactly as supplied, with no filters.
- **Recognition images** sit in a dark frame at the top of the card. `logo_fit` says how:
  `cover` fills the frame (event banners), `contain` shows the whole image and opens it full size
  on click (certificates, acceptance letters, welcome graphics), `badge` is small and centred.
  `logo_alt` describes the image for screen readers (defaults to the card title).
- **Team photos**: square, 720x720 px, the head centred and filling most of the frame (the
  page shows them as 160px circles, sharp on 3x phone screens), e.g. `marc-mechkak.webp`, then
  set `"photo"` to the file name in `team.json`. Photos appear only once every person in the list
  has one, so the grid never mixes faces with blanks. Use a new file name when a photo changes,
  so browsers don't keep showing the old one.
- **NVIDIA badge**: write `"logo": "nvidia-inception"`, which points at NVIDIA's official file.
  Never copy or edit that file: the license forbids changing its colours or proportions.
- **Only use a logo you have the right to use.** The Gemma card uses Google's official Gemma 4
  banner (from Google's google-gemma/docs repository). Google's Gemma terms grant no right to use
  its logos, so if Google or the organizers object, delete the card's `"logo"` line and it falls
  back to text.
- **Check before you deploy.** `python manage.py validate_content` checks every file strictly
  (typos in field names, missing required fields, bad dates or links, logo files that don't
  exist). `build.sh` runs it, so a broken file fails the deploy instead of quietly emptying a
  section on the live site. On the live site a broken file is logged and treated as empty.
