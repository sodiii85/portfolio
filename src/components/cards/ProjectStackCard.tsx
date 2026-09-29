import { useRef } from 'react';
import { useCardStack } from '@/hooks/useCardStack';
import { stackProjects } from '@/data/stack';
import { Link, caseStudyPath } from '@/lib/router';

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
                <Link
                  className="stack-card__cta btn-primary"
                  href={caseStudyPath(project.slug)}
                  data-stack-cta
                >
                  View case study
                  <ArrowIcon />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
