/* ============================================================
   Case study content. One entry per project, keyed by the slug
   used in stack.ts and in the /case-studies/:slug URL. Every
   image on the page is a .slot placeholder — drop an <img> into
   the matching slot (or add `src` support here) to fill it.
   ============================================================ */

export interface MetaRow {
  label: string;
  value: string;
  href?: string;
}

export interface SnapshotTab {
  id: string;
  label: string;
  heading: string;
  body: string;
}

export interface ResearchStat {
  value: string;
  label: string;
  detail?: string;
}

export interface Insight {
  percent: number;
  title: string;
  body: string;
}

export interface Swatch {
  hex: string;
  /** Adds a hairline ring so light swatches don't vanish on white. */
  outline?: boolean;
}

export interface Gallery {
  title: string;
  /** Number of screen placeholders in the frame. */
  screens: number;
  /** "large" = two big phone mockups side by side. */
  size?: 'default' | 'large';
}

export interface ProcessTab {
  id: string;
  label: string;
  galleries: Gallery[];
}

export interface NoteGroup {
  title: string;
  /** **double asterisks** mark bold phrases. */
  items: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  overview: string;
  meta: MetaRow[];
  snapshot: SnapshotTab[];
  research: {
    stats: ResearchStat[];
    goals: { label: string; body: string }[];
  };
  insights: Insight[];
  typography: { family: string; cssFamily: string; weights: string[] };
  palette: Swatch[][];
  banner?: { headline: string; highlight: string; inputLabel: string; inputValue: string };
  process: { tabs: ProcessTab[]; defaultTab: string; notes: NoteGroup[] };
  closing: { title: string; body: string }[];
}

export const caseStudies: Record<string, CaseStudy> = {
  'pocket-protector': {
    slug: 'pocket-protector',
    title: 'The Pocket Protector',
    overview:
      'We designed an AI-powered product and AI-assisted workflow to help people choose the right Medicare and insurance plans. Every design decision was grounded in keeping the user at the center, balancing user needs with business goals.',
    meta: [
      { label: 'Type', value: 'Web, App and Overall digital Experience' },
      { label: 'Role', value: 'AI UX/UI Designer' },
      { label: 'Tool', value: 'Figma and AI Google Studio' },
      { label: 'Skill', value: 'User-research, UX/UI, brand direction, Social media' },
      { label: 'Live link', value: 'thepocketprotector.com', href: 'https://thepocketprotector.com' },
      { label: 'Research link', value: 'Research Prototype', href: '#' },
    ],
    snapshot: [
      {
        id: 'results',
        label: 'Results',
        heading: 'Results',
        body: 'A self-guided flow that takes users from their first question to a recommended plan in about 10 minutes — down from a 1-hour sales call — with decision anxiety noticeably lower across 60+ tested participants.',
      },
      {
        id: 'goal',
        label: 'Goal',
        heading: 'Goal',
        body: 'Help people quickly and confidently select the right Medicare plan without jargon or pushy sales tactics, while converting manual 1-hour consultations into a seamless, self-guided digital experience.',
      },
      {
        id: 'challenge',
        label: 'Challenge',
        heading: 'Challenge',
        body: 'Medicare is dense with jargon and variables. Nearly 9 in 10 eligible users feel overwhelmed when they first see their plan choices, and our first round of testing showed traditional comparison tables made it worse.',
      },
      {
        id: 'outcome',
        label: 'Outcome',
        heading: 'Outcome',
        body: 'By combining user research from 60 interviews, AI, thoughtful product design, and behavioral principles, we built an AI-assisted workflow that replaced the manual sales journey. We reduced the process from 1 hour to 10 minutes, creating a confidence-building experience.',
      },
    ],
    research: {
      stats: [
        { value: '60+', label: 'in-depth interviews', detail: 'Ages 62–74' },
        { value: '5', label: 'moderated usability rounds', detail: '45 min each · Remote' },
        { value: '5', label: 'competitive products analyzed' },
        { value: '3', label: 'recruitment channels', detail: 'Senior Centers, UXTweaks, r/Medicare' },
      ],
      goals: [
        {
          label: 'User goal',
          body: 'Quickly and confidently select the right Medicare plan without feeling overwhelmed by jargon or pushy sales tactics.',
        },
        {
          label: 'Business goal',
          body: 'Convert manual 1-hour sales consultations into a seamless, self-guided 10-minute digital experience.',
        },
      ],
    },
    insights: [
      {
        percent: 95,
        title: 'Service dependency, low trust speed',
        body: "Users rely on health & insurance services regularly but struggle to find trusted providers fast — mirrored in Medicare's complexity.",
      },
      {
        percent: 72,
        title: 'Comparison fatigue',
        body: 'Switching between apps and sources. In Medicare, users jump between Medicare.gov, carrier sites, and brokers before enrolling.',
      },
      {
        percent: 41,
        title: 'Unreliable experience risk',
        body: 'Cancellations, unclear pricing & inconsistent quality reduce confidence. In Medicare, last-minute plan changes drive abandonment.',
      },
      {
        percent: 88,
        title: 'Overwhelmed by too many options',
        body: 'Nearly 9 in 10 Medicare-eligible users report feeling overwhelmed when first encountering plan choices — too many variables with no clear framework.',
      },
    ],
    typography: {
      family: 'Outfit',
      cssFamily: "'Outfit', var(--font)",
      weights: ['Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'],
    },
    palette: [
      [{ hex: '#8CCA0D' }, { hex: '#3CB014' }, { hex: '#15803D' }],
      [{ hex: '#1E293B' }, { hex: '#666666' }, { hex: '#FFFFFF', outline: true }],
    ],
    banner: {
      headline: 'Medicare plans dropping doctors for 2026 –',
      highlight: 'Is yours one of them?',
      inputLabel: "Enter Your Doctor's Name",
      inputValue: 'Dr. George Cooper',
    },
    process: {
      defaultTab: 'app',
      tabs: [
        {
          id: 'brainstorming',
          label: 'Brainstorming',
          galleries: [
            { title: 'Research synthesis from 60+ interviews', screens: 3 },
            { title: 'Mapping the 1-hour manual sales call', screens: 2, size: 'large' },
          ],
        },
        {
          id: 'app',
          label: 'App',
          galleries: [
            { title: 'First iteration tested with 10 users', screens: 5 },
            { title: 'A conversational UI for comparing Medicare plans', screens: 7 },
            { title: 'Major CTA updates – outline CTAs work better', screens: 2, size: 'large' },
            { title: 'Onboarding screens', screens: 4 },
            { title: 'Trust matters more when choosing at 65+', screens: 2, size: 'large' },
          ],
        },
        {
          id: 'ai',
          label: 'AI',
          galleries: [
            { title: 'AI-assisted workflow prototyped in Google AI Studio', screens: 2, size: 'large' },
            { title: 'Conversational flow variations', screens: 4 },
          ],
        },
      ],
      notes: [
        {
          title: 'Brainstorming',
          items: [
            'Conducted 60+ user interviews to uncover insights about confusion, decision anxiety, and what information seniors actually need to feel confident.',
            'Analyzed the 1-hour manual sales call to identify pain points, friction, and opportunities to introduce an AI-assisted workflow.',
          ],
        },
        {
          title: 'Usability & Decisions',
          items: [
            'Tested the first iteration with 10 users, revealing that traditional comparison tables caused cognitive overload.',
            'Pivoted to a **Conversational UI** approach, which proved much more effective at guiding users through complex Medicare plans step-by-step.',
            'Updated primary actions after testing revealed that **outline CTAs** performed better and provided clearer affordance for this demographic.',
            'Focused heavily on the insight that **Trust matters most at 65+**, designing onboarding and plan details that prioritize transparency and clarity over flashy layouts.',
          ],
        },
        {
          title: 'UI',
          items: [
            'Transformed a complex 1-hour manual process into an intuitive 10-minute digital workflow, prioritizing clarity and accessibility.',
            'Focused on behavioral and interface principles to build a confidence-boosting experience that keeps the user at the center.',
            'Chose distinct font weights and high-contrast color pairings specifically tailored to prevent visual fatigue for a senior audience.',
            'Designed extra-large, easily tappable buttons and inputs to accommodate reduced motor precision.',
          ],
        },
        {
          title: 'AI Prototype',
          items: [
            'Prototyped an AI-assisted workflow in Google AI Studio to simplify complex decision-making and replace the manual sales journey.',
            'Generated and tested different conversational flows to find the perfect balance of helpfulness and clinical clarity.',
            'Prototyped how the AI agent could instantly process demographic insights to present the single best insurance plan.',
          ],
        },
      ],
    },
    closing: [
      {
        title: 'Validation',
        body: 'User testing with 60+ participants validated that our AI-assisted workflow dramatically reduced decision anxiety. By combining thoughtful product design and AI, we successfully shrunk a stressful 1-hour sales call into a confident 10-minute experience.',
      },
      {
        title: 'Reflection',
        body: 'This project reinforced the power of grounding AI in deep user research. Balancing stakeholder business goals with genuine user needs required us to challenge standard UX patterns and prioritize extreme clarity over generic AI chatbot features.',
      },
      {
        title: 'Next steps',
        body: "Future iterations will focus on further refining the AI's contextual awareness and integrating real-time voice assistance, ensuring the digital experience remains as empathetic and helpful as a top-tier human advisor.",
      },
    ],
  },
};
