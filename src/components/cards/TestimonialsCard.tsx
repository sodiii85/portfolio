import { useEffect, useRef, useState } from 'react';
import { useCardShine } from '@/hooks/useCardShine';
import { testimonials } from '@/data/testimonials';

const AUTOPLAY_MS = 5000;

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsCard() {
  const cardRef = useRef<HTMLElement>(null);
  useCardShine(cardRef);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;
  const testimonial = testimonials[active];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  return (
    <section
      ref={cardRef}
      className="card card--testimonials"
      aria-label="Testimonials"
      aria-live="polite"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="testimonial" key={testimonial.id}>
        <blockquote className="testimonial__quote">“{testimonial.quote}”</blockquote>

        <div className="testimonial__footer">
          <div className="testimonial__author">
            <span className="testimonial__avatar" aria-hidden="true">
              {initials(testimonial.name)}
            </span>
            <span>
              <span className="testimonial__name">{testimonial.name}</span>
              <span className="testimonial__role">{testimonial.role}</span>
            </span>
          </div>

          <span className="slot slot--circle testimonial__logo" data-hint="Logo" />
          <span className="sr-only">{testimonial.project}</span>
        </div>
      </div>

      <div className="testimonials__dots">
        {testimonials.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`testimonials__dot${index === active ? ' is-active' : ''}`}
            aria-label={`Show testimonial from ${item.name}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}
