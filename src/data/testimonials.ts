export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  /** The project this testimonial is about — labels the logo slot. */
  project: string;
}

/** Placeholder quotes — swap in real client / colleague testimonials. */
export const testimonials: Testimonial[] = [
  {
    id: 'client-1',
    quote:
      'Saud turned a vague brief into a polished product in days, not weeks. The attention to detail on every screen was obvious.',
    name: 'Aisha Raza',
    role: 'Product Manager, Avialdo Solutions',
    project: 'Project One',
  },
  {
    id: 'client-2',
    quote:
      'One of the few designers who can hand off a file that engineers actually enjoy building from. Clean, thoughtful, and fast.',
    name: 'Daniyal Farooq',
    role: 'Engineering Lead, Burtix',
    project: 'Project Two',
  },
  {
    id: 'client-3',
    quote:
      "He doesn't just make things look good — he asks the right questions early, which saved us from a redesign two months later.",
    name: 'Emily Carter',
    role: 'Founder, Loopwork',
    project: 'Project Three',
  },
  {
    id: 'client-4',
    quote:
      'Working with Saud felt less like a handoff and more like a partnership. Every iteration got sharper.',
    name: 'Hassan Ali',
    role: 'Design Director, TRG',
    project: 'Project One',
  },
];
