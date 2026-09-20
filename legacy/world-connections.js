/* ============================================================
   World connections — animated curved paths linking Karachi (home)
   to each country client work has shipped to, over a dotted world
   map. Vanilla port of a React component the user provided, built
   on dotted-map + framer-motion + next-themes inside a Next.js app.

   This project is vanilla JS + Vite — no React, TypeScript,
   Tailwind, shadcn, Next.js, or framer-motion (confirmed repeatedly
   this session) — so pulling in an entire Next.js/framer-motion
   stack for one component would be a far bigger, more invasive
   change than porting its logic. What actually ported directly,
   with no framework needed at all:
     · dotted-map itself — a plain JS library (checked its
       dist/index.mjs: only deps are @turf/boolean-point-in-polygon
       and proj4, nothing React-specific), used exactly as in the
       source component;
     · the pulsing origin/destination markers — plain SVG <animate>
       elements in the original too, nothing framer-motion did there.
   What got re-implemented natively instead of ported:
     · the path draw-in/reset loop — framer-motion animated
       `pathLength` on a timeline; here it's a CSS @keyframes
       animation on stroke-dashoffset against a path with
       pathLength="1" (so dasharray/dashoffset are already 0–1,
       framer-motion or not) — same visual, no dependency;
     · the traveling dot along each path — framer-motion animated
       `offsetDistance`/`offsetPath` inline styles, which are just
       the CSS offset-path/offset-distance properties with a
       different spelling; set directly and animated with the same
       @keyframes mechanism.
   Labels are plain positioned HTML (matching this project's other
   modules) rather than the source's <foreignObject> — equivalent
   result, less DOM-namespace ceremony to build by hand.

   House rules, matching the rest of this project:
     · prefers-reduced-motion keeps the dotted map and the fully-
       drawn paths/labels, just without the loop or moving dots (a
       CSS media query on the animations, not a JS branch — nothing
       here needs WebGL or a render loop to fall back from);
     · no JS at all falls back further, to the plain .flags list
       already in the markup — the dotted map/SVG genuinely can't
       exist without dotted-map running to generate it.
   ============================================================ */

import DottedMap from 'dotted-map';

const HOME = { city: 'Karachi', country: 'Pakistan', location: [24.8607, 67.0011] };

/* labelOffset (800×400 viewBox units, same space as the projection) is
   where a client's label, marker dot, AND incoming arc all actually land
   — see anchorPoint() below for why. London/Edinburgh/Paris sit only
   ~10-15 units apart in that space (out of an 800-wide map), so with no
   offset their labels overlap badly and the arcs vanish into the cluster;
   the others are naturally far enough apart not to need one. */
const CLIENTS = [
  { city: 'London', country: 'United Kingdom', location: [51.5074, -0.1278], labelOffset: [95, -85] },
  { city: 'Edinburgh', country: 'Scotland', location: [55.9533, -3.1883], labelOffset: [-75, -100] },
  { city: 'Paris', country: 'France', location: [48.8566, 2.3522], labelOffset: [15, 65] },
  { city: 'New York', country: 'United States', location: [40.7128, -74.006] },
  { city: 'Jakarta', country: 'Indonesia', location: [-6.2088, 106.8456], labelOffset: [30, 15] },
];

const VIEW_W = 800;
const VIEW_H = 400;
const ACCENT = '#4c8dff'; // --focus
const STAGGER_S = 0.35;

function projectPoint([lat, lng]) {
  const x = (lng + 180) * (VIEW_W / 360);
  const y = (90 - lat) * (VIEW_H / 180);
  return { x, y };
}

/* The point a place's arc/marker/label all actually converge on. London,
   Edinburgh, and Paris project to within ~15 units of each other (out of
   an 800-wide map) and of Karachi itself — true-position dots there would
   sit on top of one another. labelOffset (set per client above) is the
   deliberate, hand-placed spot instead; the arc animating there (rather
   than to the true, crowded point, with a separate static line bridging
   the gap to the label) is what makes the connection actually read as
   reaching that country instead of vanishing into the cluster. */
function anchorPoint(place) {
  const { x, y } = projectPoint(place.location);
  const [dx, dy] = place.labelOffset ?? [0, 0];
  return { x: x + dx, y: y + dy };
}

function curvedPath(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

/** Pulsing marker: a solid dot plus an expanding, fading ring (native SVG <animate>). */
function markerSvg(point, { home } = {}) {
  const r = home ? 4 : 3;
  return `
    <circle cx="${point.x}" cy="${point.y}" r="${r}" fill="${home ? '#fff' : ACCENT}" />
    <circle cx="${point.x}" cy="${point.y}" r="${r}" fill="${ACCENT}" opacity="0.5">
      <animate attributeName="r" from="${r}" to="${r * 4}" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
    </circle>`;
}

/* Fraction of the map's own (2:1) height reserved as headroom above it,
   for labels like Scotland/UK that poke out above their marker. A plain
   CSS width:100%/aspect-ratio:2/1 plus a margin-top (fixed px, or even a
   percentage — which resolves against the *parent's width*, not its own
   height) both assume the parent always has enough height to spare. It
   doesn't: on the "fit-to-viewport" layout (styles.css, >=1181px wide
   and >=700px tall) .card--experience can be squeezed short enough that
   width-driven-height + headroom overflows the card's actual height,
   getting clipped anyway. Sizing by the *tighter* of the parent's width
   or height — the same fix already used for the globe and an earlier
   version of this map — is what actually holds at every card size.
   HEADROOM_RATIO is chosen so headroom = mapHeight * HEADROOM_RATIO. */
const HEADROOM_RATIO = 0.4;

function fitContainer(container) {
  const parent = container.parentElement;
  const heightIfWidthLimited = parent.clientWidth / 2;
  const heightIfHeightLimited = parent.clientHeight / (1 + HEADROOM_RATIO);
  const height = Math.min(heightIfWidthLimited, heightIfHeightLimited);
  const width = height * 2;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.marginTop = `${height * HEADROOM_RATIO}px`;
  // Labels' font-size/padding scale off this (styles.css) — a fixed CSS
  // px size stopped fitting once the map itself could shrink to fit a
  // short card, for the same reason a fixed-px margin-top above stopped
  // being enough headroom: label box size and map size need to move
  // together, or a box tuned for one card size collides again at another.
  container.style.setProperty('--conn-w', `${width}px`);
  return { width, height };
}

/**
 * Mount the dotted map + animated connections into `container` (already
 * holding the .flags fallback as real markup). Returns a teardown function.
 */
export function initWorldConnections(container) {
  if (!container) return () => {};

  const img = container.querySelector('.connections__dots');
  const svg = container.querySelector('.connections__svg');
  if (!img || !svg) return () => {};

  fitContainer(container);
  const ro = new ResizeObserver(() => fitContainer(container));
  ro.observe(container.parentElement);

  const map = new DottedMap({ height: 60, grid: 'diagonal' });
  const mapSvg = map.getSVG({
    radius: 0.22,
    color: 'rgba(237, 237, 237, 0.25)',
    shape: 'circle',
    backgroundColor: 'transparent',
  });
  img.src = `data:image/svg+xml;utf8,${encodeURIComponent(mapSvg)}`;

  const connections = CLIENTS.map((client) => ({
    from: projectPoint(HOME.location),
    to: anchorPoint(client),
  }));

  const pathsMarkup = connections
    .map(({ from, to }, i) => {
      const d = curvedPath(from, to);
      const delay = `${i * STAGGER_S}s`;
      return `
        <path
          d="${d}"
          pathLength="1"
          fill="none"
          stroke="url(#connections-gradient)"
          stroke-width="1"
          class="connections__path"
          style="animation-delay:${delay}"
        />
        <circle
          r="3"
          fill="${ACCENT}"
          class="connections__traveler"
          style="offset-path:path('${d}');animation-delay:${delay}"
        />`;
    })
    .join('');

  const markersMarkup =
    markerSvg(projectPoint(HOME.location), { home: true }) +
    connections.map(({ to }) => markerSvg(to)).join('');

  svg.innerHTML = `
    <defs>
      <linearGradient id="connections-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0" />
        <stop offset="8%" stop-color="${ACCENT}" stop-opacity="1" />
        <stop offset="92%" stop-color="${ACCENT}" stop-opacity="1" />
        <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${pathsMarkup}
    ${markersMarkup}
  `;

  const labels = [{ ...HOME, home: true }, ...CLIENTS].map((place) => {
    const { x, y } = place.home ? projectPoint(place.location) : anchorPoint(place);
    const el = document.createElement('div');
    el.className = place.home ? 'connections__label connections__label--home' : 'connections__label';
    el.style.left = `${(x / VIEW_W) * 100}%`;
    el.style.top = `${(y / VIEW_H) * 100}%`;
    el.innerHTML = `<strong>${place.country}</strong><span>${place.city}</span>`;
    container.appendChild(el);
    return el;
  });

  container.classList.add('connections--live');

  return () => {
    ro.disconnect();
    container.classList.remove('connections--live');
    container.style.width = '';
    container.style.height = '';
    container.style.marginTop = '';
    svg.innerHTML = '';
    img.removeAttribute('src');
    labels.forEach((el) => el.remove());
  };
}

export default initWorldConnections;
