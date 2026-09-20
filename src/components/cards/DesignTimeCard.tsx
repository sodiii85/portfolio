import { useEffect, useRef, useState } from 'react';
import { useCardShine } from '@/hooks/useCardShine';
import { Timeline } from '@/components/ui/timeline';
import { careerTimeline } from '@/data/career-timeline';

export function DesignTimeCard() {
  const cardRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  useCardShine(cardRef);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateFades = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setShowTopFade(scrollTop > 4);
      setShowBottomFade(scrollTop + clientHeight < scrollHeight - 4);
    };

    updateFades();
    el.addEventListener('scroll', updateFades, { passive: true });

    const resizeObserver = new ResizeObserver(updateFades);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateFades);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section ref={cardRef} className="card card--hours" aria-label="Design Time Spent">
      <div className="hours__timeline-wrap">
        <div className="hours__timeline-fade hours__timeline-fade--top" data-visible={showTopFade} />
        <div className="hours__timeline" ref={scrollRef}>
          <Timeline items={careerTimeline} variant="compact" showTimestamps={false} />
        </div>
        <div
          className="hours__timeline-fade hours__timeline-fade--bottom"
          data-visible={showBottomFade}
        />
      </div>
    </section>
  );
}
