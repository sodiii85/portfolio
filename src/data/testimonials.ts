export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  /** Out of 5 — every placeholder testimonial below reads as a five-star review. */
  rating: number;
  /** Displayed as-is, e.g. "03/14/2026". */
  date: string;
  /** Company name — resolved to a logo via Logo.dev in the corner badge. */
  company: string;
}

/** Placeholder quotes — swap in real client / colleague testimonials. */
export const testimonials: Testimonial[] = [
  {
    id: 'client-1',
    quote:
      'Saud turned a vague brief into a polished product in days, not weeks. The attention to detail on every screen was obvious.',
    name: 'Aisha Raza',
    role: 'Product Manager',
    rating: 5,
    date: '03/14/2026',
    company: 'Avialdo Solutions',
  },
  {
    id: 'client-2',
    quote:
      'One of the few designers who can hand off a file that engineers actually enjoy building from. Clean, thoughtful, and fast.',
    name: 'Daniyal Farooq',
    role: 'Engineering Lead',
    rating: 5,
    date: '01/22/2026',
    company: 'Burtix',
  },
  {
    id: 'client-3',
    quote:
      "He doesn't just make things look good — he asks the right questions early, which saved us from a redesign two months later.",
    name: 'Emily Carter',
    role: 'Founder',
    rating: 5,
    date: '11/05/2025',
    company: 'Loopwork',
  },
  {
    id: 'client-4',
    quote:
      'Working with Saud felt less like a handoff and more like a partnership. Every iteration got sharper.',
    name: 'Hassan Ali',
    role: 'Design Director',
    rating: 5,
    date: '08/30/2025',
    company: 'TRG The Royal Group',
  },
];
