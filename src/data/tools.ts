/** Logo.dev publishable key — safe to ship client-side (read-only, name/domain lookups). */
const LOGO_DEV_TOKEN = 'pk_ePrtxynQTEyKfiGqoKt6Og';

export type Tool = { label: string } & ({ domain: string } | { file: string });

/**
 * Logos come from two places:
 * - `domain`: fetched live from Logo.dev. Only used where the domain resolves
 *   to that exact product's mark — a parent-company domain (atlassian.com,
 *   adobe.com, visualstudio.com) returns the same shared logo for every
 *   product under it, so those stay local instead. GitHub's mark is also
 *   local: Logo.dev's version is solid black with no backdrop and disappears
 *   against the dark tiles.
 * - `file`: a static file in public/tools/ (svg or png, transparent background).
 */
export const TOOLS: Tool[] = [
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

export function toolLogoSrc(tool: Tool) {
  return 'domain' in tool
    ? `https://img.logo.dev/${tool.domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png&retina=true&fallback=404`
    : `/tools/${tool.file}`;
}
