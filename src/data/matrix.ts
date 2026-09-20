export interface SkillDetail {
  name: string;
  score: number;
  tool: string;
  description: string;
}

export const skillDetails: SkillDetail[] = [
  {
    name: 'AI-Driven UX Strategy',
    score: 97,
    tool: 'Claude Code',
    description:
      "Product bets get stress-tested in code, not slides. I use Claude Code to turn an AI-first strategy call into a working prototype the same day, so it's validated before design hours are spent.",
  },
  {
    name: 'Human-AI Interaction Design',
    score: 90,
    tool: 'Google AI Studio',
    description:
      'Testing how people actually talk to AI. Google AI Studio lets me prototype prompts and conversation flows before any of it reaches a screen.',
  },
  {
    name: 'UX UI Design',
    score: 88,
    tool: 'Figma',
    description:
      'Every screen starts here — wireframes, hi-fi comps, and interactive prototypes built and iterated on in Figma.',
  },
  {
    name: 'Vibe-Coding',
    score: 94,
    tool: 'Cursor',
    description:
      'Designing in code, not just mockups. Cursor lets me ship real, styled interfaces straight from intent instead of a static handoff.',
  },
  {
    name: 'Data-Driven Design',
    score: 92,
    tool: 'Google Analytics',
    description:
      'Every design decision gets a number behind it — funnels, drop-off points, and engagement pulled straight from Google Analytics.',
  },
  {
    name: 'Prompt Engineering',
    score: 86,
    tool: 'Google AI Studio',
    description:
      "Shaping how a product's AI actually responds. I write and test prompts in Google AI Studio until the model's voice matches the product's.",
  },
  {
    name: 'Cross-Functional Collaboration',
    score: 93,
    tool: 'Figma',
    description:
      'Keeping engineering, product, and design in the same file — Figma comments and dev-handoff specs are how a design stays a shared plan, not a solo one.',
  },
  {
    name: 'Innovation Strategy',
    score: 96,
    tool: 'Claude Code',
    description:
      'New feature bets get a proof of concept before a pitch deck. Claude Code turns a strategy conversation into something clickable, fast.',
  },
  {
    name: 'User Research & Insights',
    score: 99,
    tool: 'Microsoft Clarity',
    description:
      "Watching real sessions, not just survey answers — Microsoft Clarity's heatmaps and recordings show exactly where a design breaks down.",
  },
  {
    name: 'End-to-End Product Design',
    score: 91,
    tool: 'Figma',
    description:
      'From first sketch to final spec, one file carries the product — flows, states, and edge cases all mapped out in Figma.',
  },
  {
    name: 'Information Architecture',
    score: 87,
    tool: 'Figma',
    description:
      "Structuring what goes where. I map a site or app's hierarchy in Figma before a single pixel of UI gets designed.",
  },
  {
    name: 'Design Systems & Scalable UI',
    score: 88,
    tool: 'Figma',
    description:
      "Components, tokens, and variants — built once in Figma so a product can grow without every new screen starting from scratch.",
  },
  {
    name: 'AI-Assisted Prototyping',
    score: 91,
    tool: 'GitHub Copilot',
    description:
      'Prototypes that behave like real software. GitHub Copilot speeds up the code side so a click-through can go further than Figma alone.',
  },
  {
    name: 'Conversion Optimization',
    score: 93,
    tool: 'Google Analytics',
    description:
      'Every redesign gets measured against the funnel it was meant to improve, tracked in Google Analytics before and after ship.',
  },
  {
    name: 'Accessibility & Inclusive Design',
    score: 99,
    tool: 'Microsoft Clarity',
    description:
      "Accessibility isn't a checklist — Microsoft Clarity's session recordings surface exactly where keyboard and screen-reader users get stuck.",
  },
];
