import type { TimelineItem } from '@/components/ui/timeline';

/**
 * Real work history, most recent first — mirrors the LinkedIn "Experience"
 * section (Avialdo Solutions roles grouped as one progression, then prior
 * companies).
 */
export const careerTimeline: TimelineItem[] = [
  {
    id: 'product-designer',
    title: 'Product Designer',
    company: 'Avialdo Solutions',
    duration: 'Sep 2026 — Present · Karachi, Pakistan · On-site',
    description: 'Product Design, Product Design Support +1 skill.',
    status: 'active',
  },
  {
    id: 'mid-senior-ui-ux',
    title: 'Mid-Senior UI/UX Designer',
    company: 'Avialdo Solutions',
    duration: 'Jan 2023 — Sep 2026 · 3 yrs 9 mos · Karachi, Pakistan · On-site',
    description: 'Led design projects end-to-end in Figma — prototyping, responsive web design, and 18+ skills.',
    status: 'completed',
  },
  {
    id: 'design-mt',
    title: 'Design MT',
    company: 'Avialdo Solutions',
    duration: 'Sep 2021 — Jan 2023 · 1 yr 5 mos · Karachi, Pakistan',
    description: 'Mastered Figma from scratch — auto layout, prototyping, and 12+ skills.',
    status: 'completed',
  },
  {
    id: 'senior-graphic-designer',
    title: 'Senior Graphic Designer',
    company: 'Burtix',
    duration: 'Feb 2020 — Feb 2022 · 2 yrs 1 mo · Karachi, Pakistan · Remote',
    status: 'completed',
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    company: 'TRG The Royal Group',
    duration: 'Apr 2018 — Jan 2020 · 1 yr 10 mos · Karachi, Pakistan · On-site',
    status: 'completed',
  },
];
