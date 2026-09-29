import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useCardShine } from '@/hooks/useCardShine';
import { CompanyLogo } from '@/components/ui/company-logo';
import { testimonials, type Testimonial } from '@/data/testimonials';

const AUTOPLAY_MS = 4200;

/** Clockwise loop of grid cells the camera pans around: a 2x2 square
 * for up to four testimonials, the rim of a 3x3 block beyond that.
 * Offset by one cell so every stop has neighbours on all sides. */
function ringCells(count: number): [number, number][] {
  if (count <= 4) {
    return [
      [1, 1],
      [2, 1],
      [2, 2],
      [1, 2],
    ];
  }
  return [
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [3, 3],
    [2, 3],
    [1, 3],
    [1, 2],
  ];
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="testimonial-card__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          width="11"
          height="11"
          aria-hidden="true"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={i < rating ? 0 : 1.2}
        >
          <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.77l-5.18 2.68.99-5.77L1.62 7.6l5.79-.84z" />
        </svg>
      ))}
    </span>
  );
}

function TestimonialBody({ item }: { item: Testimonial }) {
  return (
    <div className="testimonial-card__body">
      <div className="testimonial-card__head">
        <span className="testimonial-card__avatar" aria-hidden="true">
          {initials(item.name)}
        </span>
        <span className="testimonial-card__meta">
          <span className="testimonial-card__name">{item.name}</span>
          <span className="testimonial-card__role">{item.role}</span>
        </span>
        <span className="slot slot--circle testimonial-card__logo" data-hint="Logo">
          <CompanyLogo company={item.company} size={64} />
        </span>
      </div>

      <blockquote className="testimonial-card__quote">“{item.quote}”</blockquote>

      <div className="testimonial-card__foot">
        <Stars rating={item.rating} />
        <span className="testimonial-card__date">{item.date}</span>
      </div>
    </div>
  );
}

export function TestimonialsCard() {
  const cardRef = useRef<HTMLElement>(null);
  useCardShine(cardRef);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const ring = ringCells(count);
  const worldSize = count <= 4 ? 4 : 5;
  const slotOf = (cellIndex: number) => ring.findIndex(([c, r]) => c + r * worldSize === cellIndex);
  const [col, row] = ring[active % ring.length];

  function advance() {
    setActive((current) => (current + 1) % Math.min(count, ring.length));
  }

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(advance, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  return (
    <section
      ref={cardRef}
      className="card card--testimonials"
      aria-label="Client testimonials"
      aria-roledescription="carousel"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="tstage">
        <div
          className="tworld"
          style={{ '--world': worldSize, '--col': col, '--row': row } as CSSProperties}
          aria-live="polite"
        >
          {Array.from({ length: worldSize * worldSize }, (_, cell) => {
            const slot = slotOf(cell);
            const item = slot >= 0 && slot < count ? testimonials[slot] : null;
            const isActive = item !== null && slot === active;

            return (
              <div
                key={cell}
                className={`tworld__cell${isActive ? ' is-active' : ''}`}
                aria-hidden={isActive ? undefined : true}
              >
                {item && <TestimonialBody item={item} />}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="testimonials__next"
          onClick={advance}
          aria-label="Show next testimonial"
        >
          <svg
            viewBox="0 0 20 20"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
