import { useRef } from 'react';
import { useCardShine } from '@/hooks/useCardShine';

export function IdentityCard() {
  const cardRef = useRef<HTMLElement>(null);
  useCardShine(cardRef);

  return (
    <section
      ref={cardRef}
      className="card card--identity"
      aria-labelledby="identity-name"
      data-shine-top="224,231,255"
      data-shine-bottom="129,140,248"
    >
      <figure className="slot slot--fill" data-hint="Drop portrait / illustration">
        <img
          src="/portrait.png"
          alt="Portrait of Muhammad Saud"
          width={380}
          height={420}
          decoding="async"
        />
      </figure>

      <div className="identity__head">
        <p className="identity__kicker">I am</p>
        <h1 className="identity__name" id="identity-name">
          Muhammad Saud
        </h1>
      </div>

      <div className="identity__social">
        <a
          className="identity__social-link identity__social-link--facebook"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" focusable="false">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <a
          className="identity__social-link identity__social-link--linkedin"
          href="https://www.linkedin.com/in/muhammadsaudmaqsood/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" focusable="false">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a
          className="identity__social-link identity__social-link--instagram"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
            <defs>
              <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
                <stop offset="0%" stopColor="#fdf497" />
                <stop offset="5%" stopColor="#fdf497" />
                <stop offset="45%" stopColor="#fd5949" />
                <stop offset="60%" stopColor="#d6249f" />
                <stop offset="90%" stopColor="#285AEB" />
              </radialGradient>
            </defs>
            <path
              fill="url(#instagram-gradient)"
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            />
          </svg>
        </a>
        <a
          className="identity__social-link identity__social-link--behance"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Behance"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" focusable="false">
            <path d="M22 7.257h-6.83v-1.611h6.83v1.611zm1.352 4.865c.043.28.06.716.052 1.319H16.88c.033 1.014.373 1.734.972 2.166.373.276.815.414 1.34.414.55 0 .996-.164 1.336-.492.185-.178.35-.42.487-.734h2.777c-.074.649-.412 1.31-1.017 1.983-.94 1.061-2.263 1.593-3.964 1.593-1.402 0-2.641-.446-3.716-1.35-1.078-.9-1.615-2.365-1.615-4.394 0-1.902.487-3.361 1.463-4.379.976-1.017 2.244-1.527 3.802-1.527.925 0 1.756.166 2.494.499.738.333 1.348.858 1.827 1.578.436.634.717 1.371.847 2.211zM19.928 10.47c-.02-.68-.238-1.201-.658-1.564-.42-.363-.937-.545-1.556-.545-.674 0-1.194.191-1.564.573-.369.383-.6.895-.688 1.536h4.466zM8.982 16.828c.535 0 .955-.084 1.263-.253.542-.301.813-.822.813-1.564 0-.626-.259-1.078-.777-1.354-.293-.157-.716-.24-1.267-.253H4.958v3.424h4.024zm.174-5.573c.542-.04.94-.19 1.192-.457.24-.257.362-.611.362-1.061 0-.44-.121-.789-.362-1.05-.263-.28-.658-.42-1.187-.42H4.958v3.023h4.198zM2.243 6.43h5.978c1.372 0 2.454.311 3.245.933.79.622 1.185 1.532 1.185 2.729 0 .87-.211 1.577-.633 2.121-.246.317-.607.605-1.083.865.72.257 1.26.667 1.617 1.229.36.562.54 1.244.54 2.045 0 .82-.207 1.559-.622 2.218-.264.427-.594.786-.99 1.076-.446.331-.973.559-1.578.68-.605.122-1.262.183-1.968.183H2.243V6.43z" />
          </svg>
        </a>
        <a
          className="identity__social-link identity__social-link--contra"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contra"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" focusable="false">
            <path d="M12 1.5 21 12l-9 10.5L3 12z" />
          </svg>
        </a>
      </div>
    </section>
  );
}
