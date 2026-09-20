import { useRef } from 'react';
import { useCardShine } from '@/hooks/useCardShine';
import { useWorldConnections } from '@/hooks/useWorldConnections';

export function ExperienceCard() {
  const cardRef = useRef<HTMLElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);
  useCardShine(cardRef);
  useWorldConnections(connectionsRef);

  return (
    <section ref={cardRef} className="card card--experience" aria-labelledby="experience-label">
      <div className="experience__head">
        <h2 className="label" id="experience-label">
          <span className="label__icon" aria-hidden="true">
            🌐
          </span>{' '}
          My Experience
        </h2>
        <a className="pill pill--action" href="#" download>
          Download CV <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="experience__body">
        {/* .flags is the real, crawlable content — the no-JS fallback.
            useWorldConnections hides it and mounts a dotted map + animated
            connection paths in its place. */}
        <div className="connections" ref={connectionsRef} data-connections>
          <img className="connections__dots" alt="" />
          <svg
            className="connections__svg"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          />
          <ul className="flags">
            <li className="flags__item">
              <span className="flags__flag" aria-hidden="true">
                🇵🇰
              </span>
              <span className="flags__label">
                <strong>Pakistan</strong>Karachi<span className="sr-only"> — home base</span>
              </span>
            </li>
            <li className="flags__item">
              <span className="flags__flag" aria-hidden="true">
                🏴󠁧󠁢󠁳󠁣󠁴󠁿
              </span>
              <span className="flags__label">
                <strong>Scotland</strong>Edinburgh
              </span>
            </li>
            <li className="flags__item">
              <span className="flags__flag" aria-hidden="true">
                🇬🇧
              </span>
              <span className="flags__label">
                <strong>United Kingdom</strong>London
              </span>
            </li>
            <li className="flags__item">
              <span className="flags__flag" aria-hidden="true">
                🇫🇷
              </span>
              <span className="flags__label">
                <strong>France</strong>Paris
              </span>
            </li>
            <li className="flags__item">
              <span className="flags__flag" aria-hidden="true">
                🇺🇸
              </span>
              <span className="flags__label">
                <strong>United States</strong>New York
              </span>
            </li>
            <li className="flags__item">
              <span className="flags__flag" aria-hidden="true">
                🇮🇩
              </span>
              <span className="flags__label">
                <strong>Indonesia</strong>Jakarta
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
