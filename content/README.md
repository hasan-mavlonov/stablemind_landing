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
- **Logos and photos** are file names only. Put recognition logos in
  `core/static/core/img/recognition/`, partner logos in `core/static/core/img/partners/` and
  photos in `core/static/core/img/team/`. If the file isn't there, the card shows the name as text
  (logos) or initials (photos). Logos are grayscale until hovered.
- **Only use a logo you have the right to use**, and check that the brand's rules allow it to be
  shown in grayscale. Google's Gemma terms grant no right to use its logos, so the Gemma card
  stays text until Google or the organizers say yes in writing.
- **Never add the NVIDIA Inception badge here.** Its license forbids changing its colours
  (grayscale included) and the homepage already shows it once, in the hero.
- **Check before you deploy.** `python manage.py validate_content` checks every file strictly
  (typos in field names, missing required fields, bad dates or links, logo files that don't
  exist). `build.sh` runs it, so a broken file fails the deploy instead of quietly emptying a
  section on the live site. On the live site a broken file is logged and treated as empty.
