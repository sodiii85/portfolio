# Portfolio Hero

Implementation of the `Portfolio Hero.dc.html` artboard from the Claude Design project
[`a0ac7137`](https://claude.ai/design/p/a0ac7137-c31b-46dd-a9ad-9e98fb900dd8).

React + TypeScript + Tailwind CSS (v4) + shadcn/ui, on Vite. Migrated from a vanilla
HTML/CSS/JS implementation — see [`legacy/`](#legacy) below for that original version.

```
index.html               Vite entry (meta/JSON-LD head, #root mount)
src/
  main.tsx                React root
  App.tsx                 page layout: topbar + bento grid of cards
  index.css               Tailwind v4 + shadcn tokens + the site's design tokens/layout CSS
  lib/utils.ts             cn() helper (clsx + tailwind-merge)
  components/
    ui/                     shadcn primitives (timeline.tsx, scroll-area.tsx)
    layout/Topbar.tsx
    cards/                  one component per bento card
    DotGridBackground.tsx   interactive dot lattice behind the page
  hooks/
    useCardShine.ts         cursor-tracked stroke highlight (per-card)
    useCardStack.ts         "0 → 1" scroll-scrubbed project deck
    useWorldConnections.ts  "My Experience" dotted map + animated connection arcs
  data/                    typed content (skills, tools, projects, career timeline)
components.json          shadcn config
public/                  served at the site root, copied verbatim into dist/
  robots.txt             crawl rules + sitemap pointer
  sitemap.xml             single-URL sitemap
  llms.txt                plain-text summary for answer engines
  site.webmanifest        PWA metadata
  favicon.svg             scalable icon
  apple-touch-icon.png
  og-image.png            1200x630 social preview
  portrait.png            identity card photo
design/                 imported source, for re-syncing against the design project
legacy/                 the original vanilla HTML/CSS/JS implementation (archived, unused)
```

## Legacy

`legacy/` holds the pre-React implementation this was migrated from — plain
`index.html` + `styles.css` + `main.js`, plus the four vanilla effect modules
(`card-shine.js`, `dot-grid.js`, `card-stack.js`, `world-connections.js`). It's not part
of the Vite build and nothing in `src/` imports from it; it's kept only as a reference for
the original approach.

## Running it

```sh
npm install       # once
npm run dev       # http://localhost:5173 with live reload
npm run build     # production bundle into dist/
npm run preview   # serve the built dist/
npm run format    # prettier --write .
npm run format:check
```

Runtime dependencies beyond React are the Space Grotesk webfont, `gsap` with InertiaPlugin
(card-shine's inertia and the project deck's scroll scrub), `dotted-map` (the "My Experience"
map), and shadcn/ui's Timeline + ScrollArea (`class-variance-authority`,
`@radix-ui/react-scroll-area`, `lucide-react`). It's a bundled app — open it through
`npm run dev` or `npm run preview` rather than from the filesystem.

## Glass cards and the stroke shine

Cards are frosted panels over the dot lattice: `rgba(18, 18, 18, 0.72)` behind
`backdrop-filter: blur(24px) saturate(150%)`, a `rgba(255, 255, 255, 0.13)` stroke, and a
1px inset top highlight. The fill stays that dark on purpose, and the blur softens the dots
behind each card into texture rather than a visible grid.

On hover the stroke lights up under the cursor and falls off along the edge. The trick is one
pseudo-element: a radial gradient fills `.card::after`, then a two-layer mask
(`content-box` + full box, composited `exclude`) subtracts everything but the 1px ring, so the
gradient can only show on the stroke. `card-shine.js` writes the pointer offset into
`--shine-x` / `--shine-y` on the hovered card, rAF-throttled; the gradient centre follows.
Measured on the top edge of a hovered card: a flat `#1e1e1e` at rest, peaking at `#c4c4c4`
under the cursor and decaying to `#222` at the far corner. `useCardShine` (`src/hooks/useCardShine.ts`)
is a small ref-based hook; each card component calls it on its own root element.

Two guards: the whole effect lives in `@media (hover: hover)`, so touch devices — which have no
hover state to light — get no pseudo-element and no listeners; and `:focus-within` lights the
ring with the highlight centred, so keyboard users see the same affordance.

## Interactive dot lattice

`src/components/DotGridBackground.tsx` ports the React Bits [`DotGrid`](https://reactbits.dev)
component's canvas/GSAP logic directly (it predates this being a React app; the port
just moved its `init()`/teardown into a `useEffect`), mounted as a page-wide fixed layer
behind `.page`. Dots tint toward `activeColor` within `proximity` of the cursor, scatter
with inertia when the pointer moves faster than `speedTrigger`, take a shockwave on click,
and settle back on an elastic ease. Tuning is the options object passed to it in
`src/App.tsx`; at 3px dots on a 24px lattice a 1440x900 viewport carries about 1,400 of them.

Because the glass cards blur whatever sits behind them, the lattice reads two ways at once:
crisp in the bento gutters and page margins, soft texture beneath the cards.

The effect bails out early when the browser has no `Path2D` or a 2D context — the page then
keeps the plain `--bg` background.

## The Spotify card

The `On Repeat` card is the playlist cover art filling the card, with Spotify's own player bar
along the bottom of it. Worth knowing before changing it: **the embed only lays out at a few
heights — 80, 152, 232 and 352px — and pads anything in between with a white block.** Sizing the
iframe to the card is therefore the one thing not to do. The bar stays at its natural 80px,
which also means nothing in it truncates, and the cover takes all the room left over.

Both come from the same playlist. To point the card at something else, take the Spotify share
link and update two places in `src/components/cards/PodcastCard.tsx`: the iframe `src` (path segment + id) and the cover
`src`, which is the `thumbnail_url` from
`https://open.spotify.com/oembed?url=<share link>` — swap its `/300/` for `/640/` for a sharper
image. Spotify regenerates a playlist's mosaic when its contents change, so that URL is worth
re-checking if the art ever 404s; the card falls back to `--surface-sunk` behind the player.

Three deviations from upstream:

- the click shockwave binds to the host card when the field lives inside one, and to `window`
  only for a page-wide layer — upstream always uses `window`, which fires shockwaves inside a
  card from clicks anywhere on the page;
- the draw loop is gated on `IntersectionObserver` plus document visibility, and skips frames
  where neither the pointer nor any dot moved, so an idle lattice of a few thousand dots costs
  nothing;
- `prefers-reduced-motion: reduce` draws the lattice once and binds no listeners at all.

GSAP's InertiaPlugin is what makes the fling physics work. It has been free since GSAP 3.13, so
it ships in the public `gsap` package — no Club GreenSock token needed. Do not pin GSAP below
3.13.

## Configure before deploy

Three things are placeholders and must be filled in:

**1. Canonical origin.** `https://example.com` is a placeholder — the site has no host yet.
Set the real one in four places:
`index.html` (canonical, OG/Twitter URLs, and the JSON-LD `@id`s), `public/sitemap.xml`,
`public/robots.txt`, and `public/llms.txt`.

**2. Dead links.** Every `href="#"` is a placeholder. Dead internal links waste crawl
budget and dilute topical relevance, so resolve or remove each one:

| Link                          | Location        |
| ----------------------------- | --------------- |
| Dashboard / Case Studies / AI | top-bar nav     |
| Learn more about my approach  | identity card   |
| Download CV                   | experience card |

**3. Job title.** JSON-LD claims `"jobTitle": "Product Designer"`. That is inferred from
the skill matrix, not stated on the artboard — correct it if it's wrong, since structured
data that contradicts the page is worse than none.

## Filling the image slots

Five `<image-slot>` placeholders from the design are now `figure.slot` elements, each with
a `data-hint` label; drop the real file into `public/` and render an `<img>` with `alt` text
and explicit `width`/`height` inside the slot — the hint hides itself via `.slot:has(img)`.
Keep the dimensions: they reserve layout space and prevent CLS.

| Slot          | Location                                                    |
| ------------- | ----------------------------------------------------------- |
| `avatar`      | top bar, right                                              |
| `portrait`    | identity card (renders grayscale, as designed)              |
| `flowers`     | skill-matrix card, bottom strip — decorative, keep `alt=""` |
| `skyline`     | "0 → 1" card                                                |
| `podcast-art` | podcast player                                              |

The two PNGs in the design project's `uploads/` are 4112×2340 pastes that exceed the design
API's 256 KiB per-file read cap, and the project has no `.image-slots.state.json` sidecar —
no slot was ever filled upstream. Nothing was lost in the import.

## SEO

- `<title>` at 56 characters and meta description at 159 — both inside SERP truncation limits.
- Canonical URL, `robots` with `max-image-preview:large`, `author`, `theme-color`.
- Open Graph (`profile` type) and Twitter `summary_large_image`, both pointing at a generated
  1200×630 preview.
- One `h1`, no skipped heading levels (`h1 → h2 → h3`), verified.
- Full icon set + web manifest.
- `robots.txt` disallows `/design/` so the reference artboard copies aren't indexed.
- **Trade-off from the React migration:** the page body is now client-rendered — a crawler or
  reader that doesn't execute JS sees only the static `<head>` (meta, JSON-LD, `llms.txt`) and
  an empty `#root` on first paint, where the old static HTML was readable without JS. The
  `Person`/`WebSite`/`ProfilePage` JSON-LD graph still covers the core facts either way, and
  the "My Experience" card keeps its `.flags` no-JS-equivalent list, but if full no-JS content
  parity matters, the next step would be prerendering/SSG (e.g. `vite-plugin-ssg` or a static
  export), not attempted here.

## AI SEO

Answer engines extract claims, so the page is built to be parsed rather than crawled for
keywords:

- **JSON-LD `@graph`** with `ProfilePage` → `WebSite` → `Person` → `PodcastEpisode`, cross-linked
  by `@id`. `Person.knowsAbout` carries all fifteen skills as machine-readable strings.
- **No fabricated ratings.** The self-assessed 86–99 scores are _not_ emitted as schema.org
  `Rating`/`aggregateRating`. Inventing review markup for your own skills is a spam signal, not
  a ranking win. The scores stay in a `<dl>` where they are honestly labelled as self-assessed.
- **`public/llms.txt`** — a plain-text summary following the [llmstxt.org](https://llmstxt.org)
  convention: positioning, focus areas, tools, and contact in prose an LLM can lift directly.
- **Name/value semantics.** The skill matrix is a `<dl>`, so each skill and score is an
  explicit pair rather than two adjacent `<span>`s.
- **Text equivalents for visual-only content.** The experience card's dotted map has a
  `.flags` list of the same six cities as real, crawlable text underneath it (see "The
  career timeline and the experience map" below) — the map is presentation, not the only
  copy of the facts. The Design Time Spent card's Timeline entries are themselves plain
  text, not SVG-only like the arc/gradient gauge they replaced.
- **Title case in markup, caps in CSS.** `.endpoint__place` uses `text-transform: uppercase`
  so the source reads "Ahmedabad", not "AHMEDABAD" — better for tokenisation.

`.sr-only` is used only to describe what is already on screen. It is never used to hide
keywords from users — that's cloaking, and it gets sites penalised.

## Code standards

- `.editorconfig` and Prettier (`.prettierrc.json` + `.prettierignore`), applied — `npm run
format:check` passes clean.
- CSS custom properties for the full palette and geometry; no magic hex values in rules.
- BEM-ish class naming, no inline styles, no `!important` outside the reduced-motion guard.
- Accessibility: skip link, one `h1`, labelled landmarks, real `button`/`a` elements for the
  segmented controls, `aria-label` on icon-only controls, `aria-hidden` on decorative emoji,
  visible `:focus-visible` rings, `prefers-reduced-motion` guard.
- Mobile-safe: verified zero horizontal overflow at 390 / 600 / 820 / 900 / 1600 px.

## Deviations from the artboard

- **Responsive instead of scaled.** The artboard rendered a fixed 1600px canvas and
  `transform: scale()`-ed it to fit the viewport. That scaler lives in the design-canvas
  runtime (`DCLogic`), not the design, so it's replaced with a real responsive grid:
  12 columns → 6 (≤1180px) → 2 (≤980px) → 1 (≤680px). Colors, type sizes, spacing, and radii
  are unchanged.
- **Fixed heights became `min-height`,** so no card can clip its own content.
- **Fits the viewport on desktop.** Above 1181x700 the page is a `100%`-height flex column:
  card `min-height`s are dropped, the two bento rows split the leftover space, and type,
  chips, cover art and the connections map scale off `vh`, so every card and icon stays on
  screen with no scrolling. Below that gate the grid reflows to 3-4 rows and the
  normal scrolling layout takes over.
- **Contact bar removed.** The artboard's footer (name, email, "Get in touch") is gone at
  request, so the page has no visible contact route; the email survives only in the
  `Person` structured data and in `llms.txt`. The bento rows absorb the freed height.
- **Anchor text lengthened** from "Learn more" to "Learn more about my approach", which wraps
  to two lines in the identity card. Generic anchor text is an SEO liability; this is the one
  intentional visual change.
- **The gauge on "Design Time Spent" is now a Timeline.** The arc/gradient SVG gauge and the
  2014/2026 endpoint pair are replaced with shadcn/ui's `Timeline` component
  (`src/components/cards/DesignTimeCard.tsx`, `src/data/career-timeline.ts`), scrollable
  within the card. **The milestone copy is a first draft**, not verified dates or job
  history — replace it before shipping.

## The career timeline and the experience map

These two cards now cover different ground on purpose, since both draw from the same 2014
Ahmedabad → 2026 Karachi arc and the same client-city list:

- **Design Time Spent** (`DesignTimeCard`) — the Timeline is about _what the hours went
  into_: the skill/focus progression (visual design → UX research → design systems →
  AI-driven UX). No city names beyond the 2014/2026 endpoints.
- **My Experience** (`ExperienceCard`) — unchanged from the original artboard: the dotted
  `dotted-map` world map with animated arcs from Karachi to each client city (Edinburgh,
  London, Paris, New York, Jakarta), ported to React in `useWorldConnections`
  (`src/hooks/useWorldConnections.ts`) with the same `.flags` no-JS fallback list.

If either card's content changes, keep that split — geography on the map, career/skill
progression on the timeline — rather than letting the two drift back into duplicating each
other.

## Re-syncing

`design/` holds the imported artboard plus its two runtime dependencies (`support.js`,
`image-slot.js`), so the original previews locally and can be diffed against the design
project after upstream edits. It is excluded from `dist/` and from indexing.
