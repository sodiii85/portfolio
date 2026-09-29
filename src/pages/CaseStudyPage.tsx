import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { useCardShine } from '@/hooks/useCardShine';
import { caseStudies, type CaseStudy, type Gallery } from '@/data/case-studies';
import { stackProjects } from '@/data/stack';
import { Link, caseStudyPath } from '@/lib/router';
import { cn } from '@/lib/utils';

/* ============================================================
   Case study — long-form project page, reached from the "View
   case study" CTA on each 0 → 1 stack card. Same glass cards and
   dot lattice as the dashboard; content comes from
   data/case-studies.ts.
   ============================================================ */

function Chevron({ direction = 'right' }: { direction?: 'left' | 'right' }) {
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
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M9.5 18L15.5 12L9.5 6" />
    </svg>
  );
}

function CsCard({
  className,
  children,
  label,
  ...rest
}: {
  className?: string;
  children: ReactNode;
  label?: string;
  'aria-label'?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useCardShine(ref);
  return (
    <section ref={ref} className={cn('card cs-card', className)} {...rest}>
      {label && <p className="label">{label}</p>}
      {children}
    </section>
  );
}

/* **bold** markup → <strong>. Only used on our own data strings. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
    </>
  );
}

/* Accessible tab strip styled as the dashboard's .segmented control. */
function Tabs({
  tabs,
  active,
  onChange,
  label,
  idPrefix,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  label: string;
  idPrefix: string;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const i = tabs.findIndex((t) => t.id === active);
    const next = tabs[(i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    onChange(next.id);
    document.getElementById(`${idPrefix}-tab-${next.id}`)?.focus();
  };

  return (
    <div className="segmented cs-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            className={cn('seg', selected && 'is-active')}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* 50-dot meter: one dot per 2%, lit in the accent colour. */
function DotMeter({ percent }: { percent: number }) {
  const lit = Math.round(percent / 2);
  return (
    <div className="cs-meter" aria-hidden="true">
      {Array.from({ length: 50 }, (_, i) => (
        <span key={i} className={cn('cs-meter__dot', i < lit && 'is-lit')} />
      ))}
    </div>
  );
}

function GalleryFrame({ gallery }: { gallery: Gallery }) {
  const large = gallery.size === 'large';
  return (
    <figure className="cs-gallery">
      <figcaption className="cs-gallery__title">{gallery.title}</figcaption>
      <div
        className={cn('cs-gallery__frame', large && 'cs-gallery__frame--large')}
        style={{ '--screens': gallery.screens } as CSSProperties}
      >
        {Array.from({ length: gallery.screens }, (_, i) => (
          <div key={i} className="slot cs-phone" data-hint={`Screen ${i + 1}`} />
        ))}
      </div>
    </figure>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="cs-header">
      <Link className="cs-back" href="/">
        <Chevron direction="left" />
        Back to case studies
      </Link>
      <h1 className="cs-header__title">{title}</h1>
    </div>
  );
}

function PrevNext({ slug }: { slug: string }) {
  const i = stackProjects.findIndex((p) => p.slug === slug);
  if (i === -1 || stackProjects.length < 2) return null;
  const prev = stackProjects[(i - 1 + stackProjects.length) % stackProjects.length];
  const next = stackProjects[(i + 1) % stackProjects.length];

  return (
    <nav className="cs-pager" aria-label="More case studies">
      <Link className="cs-pager__link" href={caseStudyPath(prev.slug)}>
        <span className="cs-pager__icon">
          <Chevron direction="left" />
        </span>
        <span className="cs-pager__text">
          <span className="cs-pager__kicker">Previous</span>
          <span className="cs-pager__name">{prev.title}</span>
        </span>
      </Link>
      <Link className="cs-pager__link cs-pager__link--next" href={caseStudyPath(next.slug)}>
        <span className="cs-pager__text">
          <span className="cs-pager__kicker">Next</span>
          <span className="cs-pager__name">{next.title}</span>
        </span>
        <span className="cs-pager__icon">
          <Chevron />
        </span>
      </Link>
    </nav>
  );
}

function CaseStudyContent({ study }: { study: CaseStudy }) {
  const [snapshotTab, setSnapshotTab] = useState(study.snapshot[study.snapshot.length - 1].id);
  const [processTab, setProcessTab] = useState(study.process.defaultTab);
  const snapshot = study.snapshot.find((t) => t.id === snapshotTab)!;
  const process = study.process.tabs.find((t) => t.id === processTab)!;

  return (
    <>
      {/* ── Overview · Snapshot · Logo ── */}
      <div className="cs-row cs-row--intro">
        <CsCard label="Overview" className="cs-overview">
          <p className="cs-body">{study.overview}</p>
          <dl className="cs-meta">
            {study.meta.map((row) => (
              <div className="cs-meta__row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  {row.href ? (
                    <a href={row.href} target="_blank" rel="noreferrer">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CsCard>

        <CsCard label="Project snapshot" className="cs-snapshot">
          <Tabs
            tabs={study.snapshot}
            active={snapshotTab}
            onChange={setSnapshotTab}
            label="Project snapshot"
            idPrefix="snapshot"
          />
          <div
            className="cs-snapshot__panel"
            role="tabpanel"
            id="snapshot-panel"
            aria-labelledby={`snapshot-tab-${snapshot.id}`}
          >
            <h2 className="cs-heading">{snapshot.heading}</h2>
            <p className="cs-body">{snapshot.body}</p>
          </div>
        </CsCard>

        <CsCard className="cs-logo" aria-label={`${study.title} logo`}>
          <figure className="slot slot--fill" data-hint="Drop project logo" />
        </CsCard>
      </div>

      {/* ── Research · Insights ── */}
      <div className="cs-row cs-row--research">
        <CsCard label="UX research & discovery" className="cs-research">
          <div className="cs-research__grid">
            <ul className="cs-stats">
              {study.research.stats.map((stat) => (
                <li className="cs-stat" key={stat.label}>
                  <span className="cs-stat__badge">{stat.value}</span>
                  <span className="cs-stat__text">
                    <strong>
                      {stat.value} {stat.label}
                    </strong>
                    {stat.detail && <span>{stat.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <div className="cs-goals">
              {study.research.goals.map((goal) => (
                <div className="cs-goal" key={goal.label}>
                  <p className="label">{goal.label}</p>
                  <p className="cs-body">{goal.body}</p>
                </div>
              ))}
            </div>
          </div>
        </CsCard>

        <CsCard label="User insights" className="cs-insights">
          <ul className="cs-insights__grid">
            {study.insights.map((insight) => (
              <li className="cs-insight" key={insight.title}>
                <DotMeter percent={insight.percent} />
                <span className="cs-insight__value">{insight.percent}%</span>
                <strong className="cs-insight__title">{insight.title}</strong>
                <p className="cs-insight__body">{insight.body}</p>
              </li>
            ))}
          </ul>
        </CsCard>
      </div>

      {/* ── Typography · Palette · Banner ── */}
      <div className="cs-row cs-row--brand">
        <CsCard label="Typography" className="cs-type">
          <div className="cs-type__body" style={{ fontFamily: study.typography.cssFamily }}>
            <p className="cs-type__glyphs">
              AaBbCcDdEeFfGg
              <br />
              HhIiJjKkLlMmNnOo
              <br />
              PpQqRrSsTtUuVv
              <br />
              WwXxYyZz
              <br />
              0123456789
              <br />
              !@#$%^&amp;*
            </p>
            <div className="cs-type__specimen">
              <span className="cs-type__family">{study.typography.family}</span>
              <span className="cs-type__aa">Aa</span>
            </div>
            <ul className="cs-type__weights">
              {study.typography.weights.map((w, i) => (
                <li key={w} style={{ fontWeight: [100, 300, 400, 500, 700, 900][i] ?? 400 }}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </CsCard>

        <CsCard label="Color palette" className="cs-palette">
          <div className="cs-palette__rows">
            {study.palette.map((row, r) => (
              <ul className="cs-palette__row" key={r}>
                {row.map((swatch) => (
                  <li className="cs-swatch" key={swatch.hex}>
                    <span
                      className={cn('cs-swatch__chip', swatch.outline && 'cs-swatch__chip--outline')}
                      style={{ background: swatch.hex }}
                    />
                    <code>{swatch.hex.replace('#', '').toLowerCase()}</code>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </CsCard>

        {study.banner && (
          <CsCard className="cs-banner" aria-label="Campaign banner">
            <div className="cs-banner__art" style={{ fontFamily: study.typography.cssFamily }}>
              <p className="cs-banner__headline">{study.banner.headline}</p>
              <p className="cs-banner__highlight">{study.banner.highlight}</p>
              <div className="cs-banner__browser" aria-hidden="true">
                <div className="cs-banner__chrome">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="cs-banner__form">
                  <span className="cs-banner__input-label">{study.banner.inputLabel}</span>
                  <span className="cs-banner__input">
                    {study.banner.inputValue}
                    <span className="cs-banner__clear">×</span>
                  </span>
                  <span className="cs-banner__progress" />
                </div>
              </div>
            </div>
          </CsCard>
        )}
      </div>

      {/* ── Iterative process ── */}
      <section className="cs-process" aria-labelledby="cs-process-title">
        <div className="cs-process__main">
          <div className="cs-process__head">
            <h2 className="cs-section-title" id="cs-process-title">
              Iterative Process
            </h2>
            <Tabs
              tabs={study.process.tabs}
              active={processTab}
              onChange={setProcessTab}
              label="Process stage"
              idPrefix="process"
            />
          </div>
          <div
            className="cs-process__galleries"
            role="tabpanel"
            id="process-panel"
            aria-labelledby={`process-tab-${process.id}`}
          >
            {process.galleries.map((gallery) => (
              <CsCard className="cs-gallery-card" key={gallery.title}>
                <GalleryFrame gallery={gallery} />
              </CsCard>
            ))}
          </div>
        </div>

        <aside className="cs-process__aside">
          <CsCard className="cs-notes" aria-label="Process notes">
            {study.process.notes.map((group) => (
              <div className="cs-notes__group" key={group.title}>
                <h3 className="cs-notes__title">{group.title}</h3>
                <ul className="cs-notes__list">
                  {group.items.map((item) => (
                    <li key={item}>
                      <RichText text={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CsCard>
        </aside>
      </section>

      {/* ── Validation · Reflection · Next steps ── */}
      <div className="cs-row cs-row--closing">
        {study.closing.map((block) => (
          <CsCard className="cs-closing" key={block.title} aria-label={block.title}>
            <h2 className="cs-heading cs-heading--sm">{block.title}</h2>
            <p className="cs-body">{block.body}</p>
          </CsCard>
        ))}
      </div>
    </>
  );
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const study = caseStudies[slug];
  const project = stackProjects.find((p) => p.slug === slug);

  return (
    <main className="cs" id="main">
      <Header title={study?.title ?? project?.title ?? 'Case study'} />

      {study ? (
        <CaseStudyContent study={study} />
      ) : (
        <CsCard className="cs-empty" aria-label="Case study coming soon">
          <h2 className="cs-heading">{project ? 'Case study coming soon' : 'Case study not found'}</h2>
          <p className="cs-body">
            {project
              ? `The full write-up for ${project.title} is in progress.`
              : "There's no case study at this address."}
          </p>
          <Link className="btn-primary cs-empty__cta" href="/">
            Back to dashboard
          </Link>
        </CsCard>
      )}

      <PrevNext slug={slug} />
    </main>
  );
}
