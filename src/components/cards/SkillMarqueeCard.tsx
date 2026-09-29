import { useCardShine } from '@/hooks/useCardShine';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { skillDetails } from '@/data/matrix';

const NAMES = skillDetails.map((skill) => skill.name);
const BASE_DURATION = 90;
const DURATION_STEP = 15;
const MIN_ROWS = 5;
const MAX_ROWS = 12;
// px per row: a pill (~31px) plus the 12px row gap, which matches the
// gap between pills. The row count is solved for whatever height the
// marquee renders at (see the ResizeObserver below) so the rows always
// fill it at that fixed spacing.
const ROW_PERIOD = 43;

/* Rows of skill names, each looping continuously — no scroll or click
   needed to see the full list, unlike the dial in SkillMatrixCard
   (kept but unrendered in App.tsx; see the comment there to bring it
   back). Every row shows the full skill list, just rotated to a
   different starting point so the rows don't line up, and duplicated
   back-to-back so a translateX(-50%) loop has no visible seam. */
const ALL_ROWS = Array.from({ length: MAX_ROWS }, (_, i) => {
  const shift = (i * 2) % NAMES.length;
  return [...NAMES.slice(shift), ...NAMES.slice(0, shift)];
});

export function SkillMarqueeCard() {
  const cardRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  useCardShine(cardRef);

  const [rowCount, setRowCount] = useState(MIN_ROWS);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const updateRowCount = () => {
      const rows = Math.ceil(el.clientHeight / ROW_PERIOD);
      setRowCount(Math.min(MAX_ROWS, Math.max(MIN_ROWS, rows)));
    };

    updateRowCount();
    const resizeObserver = new ResizeObserver(updateRowCount);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const rows = ALL_ROWS.slice(0, rowCount);

  return (
    <section ref={cardRef} className="card card--matrix card--skill-marquee" aria-label="Design Skills">
      <div className="skill-marquee-head">
        <p className="label">Skills</p>
        <h3 className="skill-marquee-head__title">Product design, powered by AI-native tools</h3>
        <p className="skill-marquee-head__desc">
          UX research, design systems, prototyping, and end-to-end product design — refined over 8
          years and now paired with AI-native tools like Claude Code and prompt engineering to turn
          strategy into shipped product, faster.
        </p>
      </div>

      <div className="skill-marquee" ref={marqueeRef}>
        <div className="skill-marquee__fade" aria-hidden="true" />
        {rows.map((row, i) => (
          <div
            className="skill-marquee__row"
            data-direction={i % 2 === 0 ? 'left' : 'right'}
            key={i}
          >
            <ul
              className="skill-marquee__track"
              aria-hidden="true"
              style={{ '--duration': `${BASE_DURATION + i * DURATION_STEP}s` } as CSSProperties}
            >
              {[...row, ...row].map((name, j) => (
                <li className="skill-marquee__pill" key={`${name}-${j}`}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="sr-only">{NAMES.join(', ')}</p>
      </div>
    </section>
  );
}
