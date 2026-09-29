import { DotGridBackground } from '@/components/DotGridBackground';
import { Topbar } from '@/components/layout/Topbar';
import { IdentityCard } from '@/components/cards/IdentityCard';
// Interactive skill dial — hidden for now in favor of SkillMarqueeCard's
// auto-scrolling tag rows. To bring it back: uncomment this import and the
// <SkillMatrixCard /> line below (and swap out <SkillMarqueeCard />).
// import { SkillMatrixCard } from '@/components/cards/SkillMatrixCard';
import { SkillMarqueeCard } from '@/components/cards/SkillMarqueeCard';
// Daily toolkit carousel — hidden for now. To bring it back: uncomment this
// import and the <ToolCarouselCard /> line below.
// import { ToolCarouselCard } from '@/components/cards/ToolCarouselCard';
import { ToolOrbitCard } from '@/components/cards/ToolOrbitCard';
import { ProjectStackCard } from '@/components/cards/ProjectStackCard';
import { TestimonialsCard } from '@/components/cards/TestimonialsCard';
import { ExperienceCard } from '@/components/cards/ExperienceCard';
import { CaseStudyPage } from '@/pages/CaseStudyPage';
import { usePathname } from '@/lib/router';
import { useEffect } from 'react';

const DOT_GRID_OPTIONS = {
  dotSize: 3,
  gap: 24,
  baseColor: '#6F75ED',
  activeColor: '#6F75ED',
  baseOpacity: 0.22,
  activeOpacity: 1,
  proximity: 130,
  speedTrigger: 100,
  shockRadius: 220,
  shockStrength: 4,
  resistance: 650,
  returnDuration: 1.4,
};

const CASE_STUDY_ROUTE = /^\/case-studies\/([^/]+)\/?$/;

export default function App() {
  const pathname = usePathname();
  const caseStudySlug = pathname.match(CASE_STUDY_ROUTE)?.[1];

  // The home dashboard locks the document to one screen on large
  // viewports (see "Fit-to-viewport dashboard" in index.css); the case
  // study is a long read, so it opts back into normal page scroll.
  useEffect(() => {
    document.documentElement.classList.toggle('is-scroll-page', Boolean(caseStudySlug));
    window.scrollTo(0, 0);
  }, [caseStudySlug]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <DotGridBackground options={DOT_GRID_OPTIONS} />

      <div className={caseStudySlug ? 'page page--case' : 'page'}>
        <Topbar />

        {caseStudySlug ? (
          <CaseStudyPage slug={caseStudySlug} key={caseStudySlug} />
        ) : (
          <main className="bento" id="main">
            <IdentityCard />
            <div className="stack-skills-row">
              <ProjectStackCard />
              <div className="matrix-stack">
                {/* <SkillMatrixCard /> */}
                <SkillMarqueeCard />
                {/* <ToolCarouselCard /> */}
              </div>
            </div>
            <div className="bottom-stack">
              <ToolOrbitCard />
              <TestimonialsCard />
              <ExperienceCard />
            </div>
          </main>
        )}
      </div>
    </>
  );
}
