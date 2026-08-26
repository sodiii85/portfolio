# Portfolio Hero

Implementation of the `Portfolio Hero.dc.html` artboard from the Claude Design project
[`a0ac7137`](https://claude.ai/design/p/a0ac7137-c31b-46dd-a9ad-9e98fb900dd8).

Static HTML + CSS, plus one JavaScript module for the animated background.

```
index.html          the page
styles.css          design tokens + layout
main.js             entry module: mounts and configures the background
gradient-waves.js   WebGL wave field (vanilla port of React Bits GradientWaves)
card-shine.js       writes the pointer position onto the hovered card
dot-grid.js         interactive dot field — staged, not mounted (see below)
public/             served at the site root, copied verbatim into dist/
  robots.txt        crawl rules + sitemap pointer
  sitemap.xml       single-URL sitemap
  llms.txt          plain-text summary for answer engines
  site.webmanifest  PWA metadata
  favicon.svg       scalable icon
  apple-touch-icon.png
  og-image.png      1200x630 social preview
assets/             drop real imagery here (vite hashes these)
design/             imported source, for re-syncing against the design project
```

## Running it

```sh
npm install       # once
npm run dev       # http://localhost:5173 with live reload
npm run build     # production bundle into dist/
npm run preview   # serve the built dist/
npm run format    # prettier --write .
npm run format:check
```

Runtime dependencies are the Space Grotesk webfont and `ogl` (~16 kB gzipped, bundled).
`gsap` is installed for `dot-grid.js` but nothing imports it yet, so it stays out of the
bundle — wiring the dot field in adds roughly 32 kB gzipped.
Because `main.js` imports `ogl` by bare specifier, the page now needs the bundler — open it
through `npm run dev` or `npm run preview` rather than from the filesystem.

## Background wave field

`gradient-waves.js` is a vanilla port of the React Bits [`GradientWaves`](https://reactbits.dev)
component — same GLSL, same option names, with the React lifecycle replaced by an `init()` that
returns its own teardown. It paints a raymarched sine-plasma wave field into the fixed
`.gradient-waves` layer behind the page, in greyscale drawn from the existing neutrals.

Two changes were needed for use as a page background:

- pointer tracking listens on `window` instead of the canvas, so parallax still works while
  the layer sits behind everything with `pointer-events: none`;
- `prefers-reduced-motion: reduce` renders one static frame instead of animating, matching the
  guard already in `styles.css`.

If WebGL2 is unavailable `initGradientWaves` returns `null` and the plain `--bg` shows through.

Tuning lives in one place, the options object in `main.js` — colors, `speed`, `amplitude`,
`brightness`, `opacity`, `detail` (`'low' | 'medium' | 'high'` raymarch steps), `grain`, and
the mouse-parallax pair. How much of it shows through the bento is set by the card
translucency in the "Background wave field" block of `styles.css`; raise that alpha back to a
solid `#161616` for opaque cards, or delete the `<script type="module">` tag and the
`.gradient-waves` div to drop the effect entirely.

## Glass cards and the stroke shine

Cards are frosted panels over the wave field: `rgba(18, 18, 18, 0.72)` behind
`backdrop-filter: blur(24px) saturate(150%)`, a `rgba(255, 255, 255, 0.13)` stroke, and a
1px inset top highlight. The fill stays that dark on purpose — the blur alone does not keep
body text legible when a bright wave crest drifts behind a card.

On hover the stroke lights up under the cursor and falls off along the edge. The trick is one
pseudo-element: a radial gradient fills `.card::after`, then a two-layer mask
(`content-box` + full box, composited `exclude`) subtracts everything but the 1px ring, so the
gradient can only show on the stroke. `card-shine.js` writes the pointer offset into
`--shine-x` / `--shine-y` on the hovered card, rAF-throttled; the gradient centre follows.
Measured on the top edge of a hovered card: a flat `#1e1e1e` at rest, peaking at `#c4c4c4`
under the cursor and decaying to `#222` at the far corner.

Two guards: the whole effect lives in `@media (hover: hover)`, so touch devices — which have no
hover state to light — get no pseudo-element and no listeners; and `:focus-within` lights the
ring with the highlight centred, so keyboard users see the same affordance.

## Interactive dot field (staged, not live)

`dot-grid.js` is a vanilla port of the React Bits [`DotGrid`](https://reactbits.dev) component:
dots tint toward `activeColor` within `proximity` of the cursor, scatter with inertia when the
pointer moves faster than `speedTrigger`, take a shockwave on click, and settle back on an
elastic ease. It is **not wired up** — nothing imports it, so it costs nothing at runtime.

To turn it on, three additions:

1. a host element inside whichever card should carry it, e.g. inside `.card--zero-one`
   (the card whose design is already a dot pattern):
   `<div class="dot-grid" data-dot-grid aria-hidden="true"></div>`
2. the host layer in `styles.css` — `.dot-grid { position: absolute; inset: 0; z-index: 0;
pointer-events: none }`, `.dot-grid__canvas { position: absolute; inset: 0; display: block }`,
   and `.card--zero-one > *:not(.dot-grid) { position: relative; z-index: 1 }` so the card's own
   content clears the canvas;
3. the mount in `main.js`:
   `initDotGrid(document.querySelector('[data-dot-grid]'), { dotSize: 3, gap: 13, baseColor:
'#2E2E2E', activeColor: '#EDEDED', proximity: 110, shockRadius: 160, shockStrength: 4,
resistance: 620, returnDuration: 1.4 })` — those values were measured to read well at card
   scale; the upstream defaults are sized for a full-page field.

If it goes on the `0 -> 1` card, also drop the static `.dot-bg` class once the canvas is up
(`initDotGrid` returns null when the browser has no `Path2D` or 2D context, so the plain
pattern stays as the fallback).

Three deviations from upstream:

- the click shockwave is bound to the host card rather than `window` — a click on the nav
  across the page firing a shockwave inside a card reads as a bug, not an effect;
- the draw loop is gated on `IntersectionObserver` plus document visibility, like
  `gradient-waves.js`, so an offscreen or backgrounded grid costs nothing;
- `prefers-reduced-motion: reduce` draws the grid once and binds no listeners at all.

GSAP's InertiaPlugin is what makes the fling physics work. It has been free since GSAP 3.13, so
it ships in the public `gsap` package — no Club GreenSock token needed. Do not pin GSAP below
3.13.

## Configure before deploy

Three things are placeholders and must be filled in:

**1. Canonical origin.** Assumed to be `https://zalak-patel.com`, derived from the
contact address. If the real host differs, update it in four places:
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
a `data-hint` label and a commented-out `<img>` carrying `alt` text and explicit
`width`/`height`. Uncomment it and point at a file in `assets/` — the hint hides itself via
`.slot:has(img)`. Keep the dimensions: they reserve layout space and prevent CLS.

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
- **Text equivalents for visual-only content.** The experience card was a decorative sphere
  with no text; it now carries an `.sr-only` sentence naming both locations. Same for the
  gauge (`<title>` in the SVG) and the elapsed/duration times.
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
  chips, gauge, cover art and globe scale off `vh`, so every card and icon stays on screen
  with no scrolling. Below that gate the grid reflows to 3-4 rows and the
  normal scrolling layout takes over.
- **Contact bar removed.** The artboard's footer (name, email, "Get in touch") is gone at
  request, so the page has no visible contact route; the email survives only in the
  `Person` structured data and in `llms.txt`. The bento rows absorb the freed height.
- **Anchor text lengthened** from "Learn more" to "Learn more about my approach", which wraps
  to two lines in the identity card. Generic anchor text is an SEO liability; this is the one
  intentional visual change.

## Re-syncing

`design/` holds the imported artboard plus its two runtime dependencies (`support.js`,
`image-slot.js`), so the original previews locally and can be diffed against the design
project after upstream edits. It is excluded from `dist/` and from indexing.
