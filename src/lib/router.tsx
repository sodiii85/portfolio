import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

/* ============================================================
   Minimal client-side router — two routes (home and a case study)
   don't justify pulling in react-router. Path-based via the
   History API; Vite's dev/preview servers already fall back to
   index.html for unknown paths, and the production host needs the
   same SPA rewrite (every path → /index.html).
   ============================================================ */

const NAVIGATE_EVENT = 'app:navigate';

export function navigate(to: string) {
  if (to === window.location.pathname + window.location.hash) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

export function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);
    window.addEventListener(NAVIGATE_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(NAVIGATE_EVENT, sync);
    };
  }, []);

  return pathname;
}

export const caseStudyPath = (slug: string) => `/case-studies/${slug}`;

/* Plain <a> that routes in-app on an unmodified left click and
   otherwise behaves like a normal link (new tab, copy link, etc.).
   Reads href off the element at click time rather than the prop:
   useCardStack recycles card DOM and rewrites the CTA's href as the
   deck rotates. */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const target = event.currentTarget.getAttribute('href') ?? href;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !target.startsWith('/')
    ) {
      return;
    }
    event.preventDefault();
    navigate(target);
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
