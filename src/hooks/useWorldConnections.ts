import { useEffect, type RefObject } from 'react';
import DottedMap from 'dotted-map';

/* ============================================================
   World connections — animated curved paths linking Karachi (home)
   to each country client work has shipped to, over a dotted world
   map. Direct port of the vanilla world-connections.js (see
   legacy/world-connections.js for the full upstream/porting notes
   on dotted-map, the CSS-driven path draw-in, and the traveling
   dot) — same DOM-building approach, just scoped to a ref and run
   from a useEffect instead of an init()/teardown pair.
   ============================================================ */

interface Place {
  city: string;
  country: string;
  location: [number, number];
  labelOffset?: [number, number];
  home?: boolean;
}

const HOME: Place = { city: 'Karachi', country: 'Pakistan', location: [24.8607, 67.0011] };

const CLIENTS: Place[] = [
  {
    city: 'London',
    country: 'United Kingdom',
    location: [51.5074, -0.1278],
    labelOffset: [95, -85],
  },
  {
    city: 'Edinburgh',
    country: 'Scotland',
    location: [55.9533, -3.1883],
    labelOffset: [-75, -100],
  },
  { city: 'Paris', country: 'France', location: [48.8566, 2.3522], labelOffset: [15, 65] },
  { city: 'New York', country: 'United States', location: [40.7128, -74.006] },
  { city: 'Jakarta', country: 'Indonesia', location: [-6.2088, 106.8456], labelOffset: [30, 15] },
];

const VIEW_W = 800;
const VIEW_H = 400;
const ACCENT = '#4c8dff'; // --focus
const STAGGER_S = 0.35;
const HEADROOM_RATIO = 0.4;

function projectPoint([lat, lng]: [number, number]) {
  const x = (lng + 180) * (VIEW_W / 360);
  const y = (90 - lat) * (VIEW_H / 180);
  return { x, y };
}

function anchorPoint(place: Place) {
  const { x, y } = projectPoint(place.location);
  const [dx, dy] = place.labelOffset ?? [0, 0];
  return { x: x + dx, y: y + dy };
}

function curvedPath(start: { x: number; y: number }, end: { x: number; y: number }) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

function markerSvg(point: { x: number; y: number }, { home = false } = {}) {
  const r = home ? 4 : 3;
  return `
    <circle cx="${point.x}" cy="${point.y}" r="${r}" fill="${home ? '#fff' : ACCENT}" />
    <circle cx="${point.x}" cy="${point.y}" r="${r}" fill="${ACCENT}" opacity="0.5">
      <animate attributeName="r" from="${r}" to="${r * 4}" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
    </circle>`;
}

function fitContainer(container: HTMLElement) {
  const parent = container.parentElement!;
  const heightIfWidthLimited = parent.clientWidth / 2;
  const heightIfHeightLimited = parent.clientHeight / (1 + HEADROOM_RATIO);
  const height = Math.min(heightIfWidthLimited, heightIfHeightLimited);
  const width = height * 2;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.marginTop = `${height * HEADROOM_RATIO}px`;
  container.style.setProperty('--conn-w', `${width}px`);
  return { width, height };
}

export function useWorldConnections(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const img = container.querySelector<HTMLImageElement>('.connections__dots');
    const svg = container.querySelector<SVGSVGElement>('.connections__svg');
    if (!img || !svg) return;

    fitContainer(container);
    const ro = new ResizeObserver(() => fitContainer(container));
    ro.observe(container.parentElement!);

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
      el.className = place.home
        ? 'connections__label connections__label--home'
        : 'connections__label';
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
  }, [containerRef]);
}
