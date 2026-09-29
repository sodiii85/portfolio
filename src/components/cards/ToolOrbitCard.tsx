import { useRef } from 'react';

import { useCardShine } from '@/hooks/useCardShine';
import OrbitingCirclesGlobe, { type Orbit } from '@/components/ui/orbiting-circles-02';
import { TOOLS, toolLogoSrc } from '@/data/tools';

/* Sized for a narrow, portrait-width column (see .card--tool-orbit):
   radii of 110 / 190 / 270px leave 80px between rings, room for the
   44px logo bubbles to pass without touching, and the outer ring is
   wider than the card so its arc runs off both edges.
   Rings from the globe outward: core design tools closest in, team
   workflow in the middle, supporting tools on the outer ring. */
const RINGS: { size: string; duration: number; tools: string[] }[] = [
  {
    size: 'w-55 h-55',
    duration: 28,
    tools: ['Figma', 'Claude', 'Framer', 'Visual Studio Code'],
  },
  {
    size: 'w-95 h-95',
    duration: 36,
    tools: ['Slack', 'Jira', 'Linear', 'ClickUp'],
  },
  {
    size: 'w-135 h-135',
    duration: 44,
    tools: ['Confluence', 'GitHub', 'Adobe Illustrator', 'Adobe Photoshop', 'Webflow'],
  },
];

// Empty rings continuing the 160px spacing outward, stepping down in
// opacity until they're gone, so the lines fill the card.
const EXTRA_RINGS = [
  { size: 'w-175 h-175', opacity: 0.65 },
  { size: 'w-215 h-215', opacity: 0.2 },
];

// Each tool appears once, spaced evenly around its ring (no mirrored
// duplicates — with 13 real tools the rings are already full).
const ORBITS: Orbit[] = RINGS.map((ring) => ({
  size: ring.size,
  duration: ring.duration,
  icons: ring.tools.map((label, i) => {
    const tool = TOOLS.find((t) => t.label === label)!;
    return { src: toolLogoSrc(tool), alt: label, angle: (360 / ring.tools.length) * i };
  }),
}));

export function ToolOrbitCard() {
  const cardRef = useRef<HTMLElement>(null);
  useCardShine(cardRef);

  return (
    <section ref={cardRef} className="card card--tool-orbit" aria-label="Daily toolkit">
      <div className="tool-orbit-head">
        <p className="label">Toolkit</p>
        <h3 className="tool-orbit-head__title">The tools I design and ship with</h3>
      </div>

      <OrbitingCirclesGlobe
        orbits={ORBITS}
        mirror={false}
        className="tool-orbit h-auto md:h-auto"
        globeClassName="w-42 md:w-42"
        particleCount={300}
        bubbleSize={44}
        extraRings={EXTRA_RINGS}
        fadeLines
      />
      <p className="sr-only">{TOOLS.map((t) => t.label).join(', ')}</p>
    </section>
  );
}
