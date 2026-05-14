# Mindform

The personality layer for AI. This is the landing site for
[mindform-ai.com](https://mindform-ai.com).

## Run

```bash
cd mindform
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-first `@theme` in `app/globals.css`)
- Framer Motion for the cast card flip
- `next/font/google` for Fraunces, Inter, JetBrains Mono, Caveat
- All illustrations are inline SVG in `components/cast/`. No image assets.
- Dark / light theme toggle, persisted to localStorage, no flash on load.

## Structure

```
mindform/
  app/
    layout.tsx        fonts + theme bootstrap
    page.tsx          homepage
    cast/page.tsx     full cast grid
    docs/page.tsx     system-aesthetic API reference
    pricing/page.tsx  three tier table
    globals.css       palette tokens + animations
  components/
    cast/             six SVG character components
    marketing/        Hero, Pitch, CastCard, CastRow, PullQuote, UseCases, etc.
    system/           CodeBlock, MetricCard, CursorDot (system surfaces)
    shared/           Header, Footer, ThemeToggle
  lib/cast.ts         cast metadata: name, quote, behavior params
```

## Design rationale

Most AI startup sites in 2026 look identical. Dark background, one neon
gradient, Inter, a glass card, a subtle particle field. The product they
sell is a model, so they show off the model: clean, neutral, infinite.

Mindform does not sell a model. It sells personality. A site that looks
like every other AI site would directly contradict the pitch. So the
marketing surface is the opposite of the template: paper-cream background,
Fraunces in optical-sized 144 at sixty pixels, hand-drawn cast members
with hard two-pixel outlines, a single hand-written font for the character
quotes. It reads like a magazine, not a pitch deck. The cast floats. The
illustrations wobble on hover. The pricing tables sneak in monospace,
because the system surface is right there underneath.

The system surface, /docs and the SystemPreview block, then snaps to the
opposite extreme: off-black, JetBrains Mono, one tomato accent that
matches the marketing palette so the two halves feel like one product.
That hard switch is the point. Marketing is for the buyer. Docs are for
the engineer. The two audiences expect different rooms, so we built two
rooms with a shared color.

The one accent that bridges both surfaces is `#E84A3C`. It is the only
color allowed inside the system aesthetic and it is one of the six fill
colors on the marketing side. That single thread does the work that
gradients usually do in this category.

## Constraints honored

- No em dashes anywhere in the user-facing copy.
- No "AI-powered", "revolutionary", "next-generation", "unlock", or similar.
- Every headline is a real sentence with a period.
- All text is real HTML text, not text-in-SVG.
- All illustrations are inline SVG. Nothing larger than a favicon ships as a
  binary asset.
- Mobile: hero stacks, cast becomes a horizontal scroll, type scales down.
- No `<form>` tags anywhere.
- Theme toggle in the header on every page.
