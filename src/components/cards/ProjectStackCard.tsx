import { useRef } from 'react';
import { useCardStack } from '@/hooks/useCardStack';
import { stackProjects } from '@/data/stack';

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M9.5 18L15.5 12L9.5 6" />
    </svg>
  );
}

export function ProjectStackCard() {
  const stackRef = useRef<HTMLDivElement>(null);
  useCardStack(stackRef);

  return (
    <section className="card--zero-one" aria-labelledby="zeroone-label">
      <h2 className="sr-only" id="zeroone-label">
        0 → 1 — Craft + Judgement = Shipped.
      </h2>

      <div className="stack" ref={stackRef} data-stack>
        {/* Timeline rail: one node per project, in the same order as the
            cards beside it. Clicking a node runs the deck to that project
            (useCardStack) — the same `target` the wheel drives, so a click
            and a scroll can never disagree about where the deck is. */}
        <ol className="stack__rail" data-stack-rail aria-label="Projects">
          {stackProjects.map((project) => (
            <li className="stack__rail-item" key={project.title}>
              <button className="stack-dot" type="button" data-stack-dot>
                <span className="slot slot--circle stack-dot__logo" data-hint="Logo" />
                <span className="sr-only" data-stack-dot-label>
                  {project.title}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="stack__viewport" data-stack-viewport>
          {stackProjects.map((project) => (
            <article className="stack-card" data-stack-card key={project.title}>
              <figure className="slot stack-card__image" data-hint="Drop project screenshot" />
              <div className="stack-card__footer">
                <div className="stack-card__text">
                  <span className="stack-card__title" data-stack-title>
                    {project.title}
                  </span>
                  <span className="stack-card__desc" data-stack-desc>
                    {project.description}
                  </span>
                </div>
                <a className="stack-card__cta btn-primary" href={project.href} data-stack-cta>
                  Read
                  <ArrowIcon />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
