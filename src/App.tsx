import { DotGridBackground } from '@/components/DotGridBackground';
import { Topbar } from '@/components/layout/Topbar';
import { IdentityCard } from '@/components/cards/IdentityCard';
import { DesignTimeCard } from '@/components/cards/DesignTimeCard';
import { SkillMatrixCard } from '@/components/cards/SkillMatrixCard';
import { ToolCarouselCard } from '@/components/cards/ToolCarouselCard';
import { ProjectStackCard } from '@/components/cards/ProjectStackCard';
import { TestimonialsCard } from '@/components/cards/TestimonialsCard';
import { ExperienceCard } from '@/components/cards/ExperienceCard';

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

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <DotGridBackground options={DOT_GRID_OPTIONS} />

      <div className="page">
        <Topbar />

        <main className="bento" id="main">
          <IdentityCard />
          <DesignTimeCard />
          <div className="matrix-stack">
            <SkillMatrixCard />
            <ToolCarouselCard />
          </div>
          <TestimonialsCard />
          <ProjectStackCard />
          <ExperienceCard />
        </main>
      </div>
    </>
  );
}
