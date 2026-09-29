import { useState } from 'react';

import { ToolDock, ToolDockTile, type ToolDockItem } from '@/components/ui/techstack';
import { TOOLS, toolLogoSrc } from '@/data/tools';

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
