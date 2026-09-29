export interface StackProject {
  title: string;
  description: string;
  /** Case study slug — the card's CTA links to /case-studies/:slug.
      Order here also drives the case study page's previous/next links. */
  slug: string;
}

export const stackProjects: StackProject[] = [
  {
    title: 'The Pocket Protector',
    description: 'AI-assisted Medicare plan selection, 1 hour → 10 minutes',
    slug: 'pocket-protector',
  },
  { title: 'Z Fit', description: 'Add a one-line project summary', slug: 'z-fit' },
  { title: 'Live Portfolio', description: 'Add a one-line project summary', slug: 'live-portfolio' },
];
