import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useCardShine } from '@/hooks/useCardShine';
import { skillDetails } from '@/data/matrix';

const RADIUS_X = 460;
const RADIUS_Y = 300;
const ANGLE_STEP = 8;
const COUNT = skillDetails.length;
// The wrap in circularOffset only ever produces |diff| <= COUNT / 2, so
// this is the natural ceiling — past it every item is already showing.
const VISIBLE_RANGE = Math.floor(COUNT / 2);
const BASE_SHIFT = 36;
const WHEEL_STEP = 46;
// Both the dial and its skeleton copies are shorter than 2 * RADIUS_Y in
// most layouts (the grid row is sized by the detail column's content, not
// by the arc's reach), so the outer items were landing outside the box
// and getting hard-clipped by overflow: hidden instead of fading out.
// Scale the vertical radius to whatever height is actually rendered,
// leaving room for the mask's fade so the edge is a fade, not a cut.
const RADIUS_Y_FADE_BUFFER = 28;

function fittedRadiusY(containerHeight: number) {
  if (!containerHeight) return RADIUS_Y;
  return Math.max(60, Math.min(RADIUS_Y, containerHeight / 2 - RADIUS_Y_FADE_BUFFER));
}

function circularOffset(index: number, active: number) {
  let diff = (((index - active) % COUNT) + COUNT) % COUNT;
  if (diff > COUNT / 2) diff -= COUNT;
  return diff;
}

const wrap = (n: number, m: number) => ((n % m) + m) % m;

/* Five physical sticky notes, ring-buffered by depth slot. Each note
   keeps a stable id (and paper shade) for its whole life; only its
   slot — and therefore the skill it's showing — advances by one each
   time the active skill changes, so the front note always slides to
   the back and the next one peeks up to take its place. */
const NOTE_COUNT = 5;
const NOTE_COLORS = ['#d8d8d1', '#cdcdc4', '#c3c3b9', '#dbdad0', '#c8c7bc'];
const SLOT_STYLE = [
  { x: 0, y: 0, rotate: -3, scale: 1, opacity: 1 },
  { x: 18, y: -10, rotate: 7, scale: 0.96, opacity: 0.97 },
  { x: -20, y: 8, rotate: -8, scale: 0.92, opacity: 0.94 },
  { x: 14, y: 20, rotate: 5, scale: 0.88, opacity: 0.91 },
  { x: -16, y: -16, rotate: -6, scale: 0.84, opacity: 0.88 },
];

/* Decorative, non-interactive copies of the real dial — same arc math
   (offset, angleDeg, arcX/arcY) as the live matrix__dial-item buttons
   below, just rendered as static blackish bars instead of text, and
   repeated side by side to fill the card as background texture. */
const GHOST_WHEEL_COUNT = 6;
const GHOST_OFFSETS = Array.from({ length: VISIBLE_RANGE * 2 + 1 }, (_, i) => i - VISIBLE_RANGE);

function ghostWidth(offset: number) {
  if (offset === 0) return 0.84;
  const wave = Math.sin(offset * 1.7 + 2.1);
  return 0.42 + ((wave + 1) / 2) * 0.4;
}

function ghostBarStyle(offset: number, radiusY: number): CSSProperties {
  const distance = Math.abs(offset);
  const angleDeg = offset * ANGLE_STEP;
  const rad = (angleDeg * Math.PI) / 180;
  const arcX = RADIUS_X * (1 - Math.cos(rad));
  const arcY = radiusY * Math.sin(rad);

  return {
    width: `${ghostWidth(offset) * 100}%`,
    height: offset === 0 ? 18 : 13,
    transform: `translateY(-50%) translate(${BASE_SHIFT - arcX}px, ${arcY}px) rotate(${angleDeg}deg)`,
    opacity: offset === 0 ? 0.9 : Math.max(0.35, 0.7 - distance * 0.045),
  };
}

interface NoteStack {
  step: number;
  skills: number[];
}

function initNoteStack(): NoteStack {
  return {
    step: 0,
    skills: Array.from({ length: NOTE_COUNT }, (_, id) => id % COUNT),
  };
}

export function SkillMatrixCard() {
  const cardRef = useRef<HTMLElement>(null);
  useCardShine(cardRef);
  const dialRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);
  const wheelAccum = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = skillDetails[activeIndex];

  const [dialHeight, setDialHeight] = useState(0);
  const [skeletonHeight, setSkeletonHeight] = useState(0);
  const dialRadiusY = fittedRadiusY(dialHeight);
  const skeletonRadiusY = fittedRadiusY(skeletonHeight);

  useEffect(() => {
    const dial = dialRef.current;
    const skeleton = skeletonRef.current;
    if (!dial || !skeleton) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === dial) setDialHeight(entry.contentRect.height);
        if (entry.target === skeleton) setSkeletonHeight(entry.contentRect.height);
      }
    });
    observer.observe(dial);
    observer.observe(skeleton);
    return () => observer.disconnect();
  }, []);

  const [noteStack, setNoteStack] = useState<NoteStack>(initNoteStack);
  const prevActiveRef = useRef(activeIndex);

  useEffect(() => {
    if (prevActiveRef.current === activeIndex) return;
    prevActiveRef.current = activeIndex;
    setNoteStack((prev) => {
      const step = prev.step + 1;
      const frontId = step % NOTE_COUNT;
      const skills = prev.skills.slice();
      skills[frontId] = activeIndex;
      return { step, skills };
    });
  }, [activeIndex]);

  useEffect(() => {
    const dial = dialRef.current;
    if (!dial) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      wheelAccum.current += event.deltaY;
      while (Math.abs(wheelAccum.current) >= WHEEL_STEP) {
        const dir = wheelAccum.current > 0 ? 1 : -1;
        setActiveIndex((i) => (i + dir + COUNT) % COUNT);
        wheelAccum.current -= dir * WHEEL_STEP;
      }
    };

    dial.addEventListener('wheel', handleWheel, { passive: false });
    return () => dial.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section ref={cardRef} className="card card--matrix" aria-label="Design Skill Matrix">
      <p className="sr-only">Scroll the dial, or use the arrow keys, to preview each skill&apos;s tooling.</p>

      <div className="matrix__skeleton" ref={skeletonRef} aria-hidden="true">
        <div className="matrix__skeleton-fade">
          {Array.from({ length: GHOST_WHEEL_COUNT }, (_, wheelIndex) => (
            <div className="matrix__skeleton-wheel" key={wheelIndex}>
              {GHOST_OFFSETS.map((offset) => (
                <span
                  key={offset}
                  className="matrix__skeleton-bar"
                  style={ghostBarStyle(offset, skeletonRadiusY)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="matrix">
        <div
          className="matrix__dial"
          ref={dialRef}
          role="listbox"
          aria-label="Skills"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex((i) => (i + 1) % COUNT);
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((i) => (i - 1 + COUNT) % COUNT);
            }
          }}
        >
          {skillDetails.map((skill, index) => {
            const offset = circularOffset(index, activeIndex);
            const distance = Math.abs(offset);
            const isActive = offset === 0;
            const isVisible = distance <= VISIBLE_RANGE;
            const angleDeg = offset * ANGLE_STEP;
            const rad = (angleDeg * Math.PI) / 180;
            const arcX = RADIUS_X * (1 - Math.cos(rad));
            const arcY = dialRadiusY * Math.sin(rad);
            // Stay crisp for most of the sweep — only the last couple of
            // items before the corner pick up any blur.
            const blur = distance >= VISIBLE_RANGE - 1 ? (distance - (VISIBLE_RANGE - 2)) * 3 : 0;

            return (
              <button
                key={skill.name}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`matrix__dial-item${isActive ? ' is-active' : ''}`}
                style={{
                  transform: `translateY(-50%) translate(${BASE_SHIFT - arcX}px, ${arcY}px) rotate(${angleDeg}deg)`,
                  filter: isActive ? 'none' : `blur(${blur}px)`,
                  opacity: isVisible ? 1 - distance * 0.06 : 0,
                  pointerEvents: isVisible ? 'auto' : 'none',
                  zIndex: 100 - distance,
                }}
                onClick={() => setActiveIndex(index)}
              >
                {skill.name}
              </button>
            );
          })}
        </div>

        <div className="matrix__detail">
          <div className="matrix__notes" aria-hidden="true">
            {Array.from({ length: NOTE_COUNT }, (_, id) => {
              const slot = wrap(noteStack.step - id, NOTE_COUNT);
              const skill = skillDetails[noteStack.skills[id]];
              const { x, y, rotate, scale, opacity } = SLOT_STYLE[slot];
              return (
                <div
                  key={id}
                  className="matrix__note"
                  style={
                    {
                      '--note-bg': NOTE_COLORS[id],
                      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
                      opacity,
                      zIndex: NOTE_COUNT - slot,
                    } as CSSProperties
                  }
                >
                  <span className="matrix__note-tool">{skill.tool}</span>
                  <p className="matrix__note-text">{skill.description}</p>
                </div>
              );
            })}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {active.tool}: {active.description}
          </p>
        </div>
      </div>
    </section>
  );
}
