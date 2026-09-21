import { useState } from 'react';

/** Logo.dev publishable key — safe to ship client-side (read-only, name/domain lookups). */
const LOGO_DEV_TOKEN = 'pk_ePrtxynQTEyKfiGqoKt6Og';

interface CompanyLogoProps {
  company: string;
  size?: number;
  className?: string;
}

/**
 * Renders a company's logo via Logo.dev. Falls back to nothing (rather than
 * Logo.dev's default monogram) so the surrounding `.slot` placeholder shows
 * through when a company can't be resolved.
 */
export function CompanyLogo({ company, size = 128, className }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const src = `https://img.logo.dev/name/${encodeURIComponent(company)}?token=${LOGO_DEV_TOKEN}&size=${size}&format=png&retina=true&fallback=404`;

  return (
    <img
      src={src}
      alt={`${company} logo`}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
