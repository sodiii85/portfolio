import { useState } from 'react';

import { ToolDock, ToolDockTile, type ToolDockItem } from '@/components/ui/techstack';

/** Logo.dev publishable key — safe to ship client-side (read-only, name/domain lookups). */
const LOGO_DEV_TOKEN = 'pk_ePrtxynQTEyKfiGqoKt6Og';

/**
 * Logos come from two places:
 * - `domain`: fetched live from Logo.dev. Only used where the domain resolves
 *   to that exact product's mark — a parent-company domain (atlassian.com,
 *   adobe.com, visualstudio.com) returns the same shared logo for every
 *   product under it, so those stay local instead. GitHub's mark is also
 *   local: Logo.dev's version is solid black with no backdrop and disappears
 *   against this tile's dark background.
 * - `file`: a static file in public/tools/ (svg or png, transparent background).
 */
const TOOLS = [
  { label: 'Slack', domain: 'slack.com' },
  { label: 'Jira', file: 'jira.svg' },
  { label: 'Confluence', file: 'confluence.svg' },
  { label: 'GitHub', file: 'github.svg' },
  { label: 'Adobe Illustrator', file: 'illustrator.svg' },
  { label: 'Adobe Photoshop', file: 'photoshop.svg' },
  { label: 'Figma', domain: 'figma.com' },
  { label: 'Claude', domain: 'claude.ai' },
  { label: 'ClickUp', domain: 'clickup.com' },
  { label: 'Linear', domain: 'linear.app' },
  { label: 'Visual Studio Code', file: 'vscode.svg' },
  { label: 'Framer', domain: 'framer.com' },
  { label: 'Webflow', domain: 'webflow.com' },
];

function toolLogoSrc(tool: (typeof TOOLS)[number]) {
  return 'domain' in tool
    ? `https://img.logo.dev/${tool.domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png&retina=true&fallback=404`
    : `/tools/${tool.file}`;
}

function ToolTile({ label, src }: { label: string; src: string }) {
  const [broken, setBroken] = useState(false);

  return (
    <ToolDockTile className="bg-[#161616]">
      {!broken && (
        <img
          src={src}
          alt=""
          draggable={false}
          className="size-[58%] object-contain"
          onError={() => setBroken(true)}
        />
      )}
      <span className="sr-only">{label}</span>
    </ToolDockTile>
  );
}

const items: ToolDockItem[] = TOOLS.map((tool) => ({
  label: tool.label,
  icon: <ToolTile label={tool.label} src={toolLogoSrc(tool)} />,
}));

export function ToolCarouselCard() {
  return (
    <section className="card--tool-carousel" aria-label="Daily toolkit">
      <ToolDock items={items} size={72} overlap={0.14} magnification={0.3} label="Daily toolkit" />
    </section>
  );
}
