import { useState } from 'react';

import { ToolDock, ToolDockTile, type ToolDockItem } from '@/components/ui/techstack';

/** Drop a matching file in public/tools/ (svg or png, transparent background). */
const TOOLS = [
  { label: 'Slack', file: 'slack.svg' },
  { label: 'Jira', file: 'jira.svg' },
  { label: 'Confluence', file: 'confluence.svg' },
  { label: 'GitHub', file: 'github.svg' },
  { label: 'Adobe Illustrator', file: 'illustrator.svg' },
  { label: 'Adobe Photoshop', file: 'photoshop.svg' },
  { label: 'Figma', file: 'figma.svg' },
  { label: 'Claude', file: 'claude.svg' },
  { label: 'ClickUp', file: 'clickup.svg' },
  { label: 'Linear', file: 'linear.svg' },
  { label: 'Visual Studio Code', file: 'vscode.svg' },
  { label: 'Framer', file: 'framer.svg' },
  { label: 'Webflow', file: 'webflow.svg' },
];

function ToolTile({ label, file }: { label: string; file: string }) {
  const [broken, setBroken] = useState(false);

  return (
    <ToolDockTile className="bg-[#161616]">
      {!broken && (
        <img
          src={`/tools/${file}`}
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
  icon: <ToolTile label={tool.label} file={tool.file} />,
}));

export function ToolCarouselCard() {
  return (
    <section className="card--tool-carousel" aria-label="Daily toolkit">
      <ToolDock items={items} size={72} overlap={0.14} magnification={0.3} label="Daily toolkit" />
    </section>
  );
}
