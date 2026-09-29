import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import ParticleSphereAnimation from '@/components/ui/orbiting-circles-02-utils/particalsphear';

export interface OrbitIcon {
  src: string;
  alt: string;
  /** Starting position on the ring, in degrees (0 = top). */
  angle: number;
}

export interface Orbit {
  /** Tailwind width/height classes for the ring. */
  size: string;
  /** Seconds per full revolution. */
  duration: number;
  icons: OrbitIcon[];
}

const DEMO_ORBITS: Orbit[] = [
  {
    size: 'w-110 h-110 md:w-180 md:h-180',
    duration: 18,
    icons: [
      {
        src: 'https://cdn.21st.dev/assets/mirror/27/279f60ffd95d6d6e982c0d9544f465b21ba7895d2a7ba9dc2ea798f0aad31074.svg',
        alt: 'Supabase',
        angle: -60,
      },
      {
        src: 'https://cdn.21st.dev/assets/mirror/fd/fd242636f2a6c8ce90ddf51d45234a7add1a7262d0d517ef551a290d99fdb620.svg',
        alt: 'Gemini',
        angle: 0,
      },
      {
        src: 'https://cdn.21st.dev/assets/mirror/d2/d27b280b7858bb5b89008eb325b9d4bdbd93ee1df92f8210247da4abc8a9c1ce.svg',
        alt: 'Make',
        angle: 60,
      },
    ],
  },
  {
    size: 'w-150 h-150 md:w-220 md:h-220',
    duration: 24,
    icons: [
      {
        src: 'https://cdn.21st.dev/assets/mirror/cd/cdf9d8e18269a990e7854c0255d64513e5f8b6052b8580dd8f24480a85ec130a.svg',
        alt: 'Figma',
        angle: 0,
      },
      {
        src: 'https://cdn.21st.dev/assets/mirror/83/83a5f27a428146febbe4672046c78bfa796a7931aebab5705655cab4fffb5794.svg',
        alt: 'Slack',
        angle: -90,
      },
    ],
  },
  {
    size: 'w-180 h-180 md:w-265 md:h-265',
    duration: 30,
    icons: [
      {
        src: 'https://cdn.21st.dev/assets/mirror/b5/b58af96de173670c64254e6d93ca4e4daf57b2637cc4fb90529f3232ea1bdf3f.svg',
        alt: 'Claude',
        angle: -60,
      },
      {
        src: 'https://cdn.21st.dev/assets/mirror/a2/a21f0f00193ad70e39d2d82b6437464853f77bf6569adeb1ecc6d1f7bc0f5226.svg',
        alt: 'React',
        angle: 0,
      },
      {
        src: 'https://cdn.21st.dev/assets/mirror/96/96c6123c466766d6714874ae77ba88be923c98313f09bbd72c9860ff26797d53.svg',
        alt: 'Python',
        angle: 60,
      },
    ],
  },
];

interface OrbitingCirclesGlobeProps {
  orbits?: Orbit[];
  /** Duplicate every icon 180° across its ring so each side stays populated. */
  mirror?: boolean;
  className?: string;
  /** Overrides the globe's default width classes. */
  globeClassName?: string;
  /** Dots on the globe — fewer reads as more open. */
  particleCount?: number;
  /** Fixed icon-bubble diameter in px; omit for the default responsive 48/64px. */
  bubbleSize?: number;
  /** Icon-less rings drawn outside the orbits, each at its own opacity. */
  extraRings?: { size: string; opacity: number }[];
  /** Fade the ring lines out toward the top (icons stay fully visible). */
  fadeLines?: boolean;
}

function OrbitIconImage({ src, alt, size }: { src: string; alt: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  const sizeStyle = size ? { width: size, height: size } : undefined;
  if (broken)
    return <span className="block size-6 md:size-8" style={sizeStyle} aria-hidden="true" />;

  return (
    <img
      src={src}
      alt={alt}
      width={32}
      height={32}
      loading="lazy"
      draggable={false}
      className="size-6 object-contain md:size-8"
      style={sizeStyle}
      onError={() => setBroken(true)}
    />
  );
}

export default function OrbitingCirclesGlobe({
  orbits = DEMO_ORBITS,
  mirror = true,
  className,
  globeClassName,
  particleCount,
  bubbleSize,
  extraRings = [],
  fadeLines = false,
}: OrbitingCirclesGlobeProps) {
  const lines = [...orbits.map((o) => ({ size: o.size, opacity: 1 })), ...extraRings];
  const fadeMask = 'linear-gradient(to top, #000 35%, transparent 100%)';

  return (
    <div
      className={cn(
        'relative flex h-110 w-full justify-center overflow-hidden md:h-160',
        className
      )}
    >
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)) }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) - 360deg)) }
        }
        @keyframes counter-cw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)) }
        }
        @keyframes counter-ccw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)) }
        }
        /* The site-wide reduced-motion rule shrinks every animation to
           0.01ms, which would make these infinite loops flicker — drop the
           animation instead so icons rest at their start angles. */
        @media (prefers-reduced-motion: reduce) {
          .orbit-spin { animation: none !important; }
        }
      `}</style>

      {/* Center particle globe */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-0 left-1/2 z-10 aspect-square w-75 -translate-x-1/2 translate-y-1/2 md:w-145',
          globeClassName
        )}
      >
        <ParticleSphereAnimation particleCount={particleCount} />
      </div>

      {/* Ring lines, on their own layer so they can fade without fading the icons */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={fadeLines ? { maskImage: fadeMask, WebkitMaskImage: fadeMask } : undefined}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-border',
              line.size
            )}
            style={{ opacity: line.opacity }}
          />
        ))}
      </div>

      {/* Orbiting rings */}
      {orbits.map((orbit, index) => {
        const isCW = index % 2 === 0;
        const orbitAnim = isCW ? 'orbit-cw' : 'orbit-ccw';
        const counterAnim = isCW ? 'counter-cw' : 'counter-ccw';

        const allIcons = mirror
          ? [
              ...orbit.icons,
              ...orbit.icons.map((ic) => ({
                ...ic,
                angle: ic.angle + 180,
                alt: `${ic.alt}-mirror`,
              })),
            ]
          : orbit.icons;

        return (
          <div
            key={index}
            className={cn(
              'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full',
              orbit.size
            )}
          >
            {allIcons.map((iconData, iconIndex) => (
              <div
                key={iconIndex}
                className={cn(
                  'orbit-spin absolute top-0 left-1/2 flex h-1/2 origin-bottom flex-col items-center justify-start',
                  !bubbleSize && '-ml-8'
                )}
                style={
                  {
                    ...(bubbleSize && { marginLeft: -bubbleSize / 2 }),
                    '--start-angle': `${iconData.angle}deg`,
                    transform: 'rotate(var(--start-angle))',
                    animation: `${orbitAnim} ${orbit.duration}s linear infinite`,
                  } as React.CSSProperties
                }
              >
                <div
                  className={cn(
                    'orbit-spin relative z-10 rounded-full border border-border bg-background',
                    bubbleSize ? 'flex items-center justify-center' : '-mt-8 p-3 sm:p-4'
                  )}
                  title={iconData.alt.replace(/-mirror$/, '')}
                  style={
                    {
                      ...(bubbleSize && {
                        width: bubbleSize,
                        height: bubbleSize,
                        marginTop: -bubbleSize / 2,
                      }),
                      '--counter-offset': `${-iconData.angle}deg`,
                      transform: 'rotate(var(--counter-offset))',
                      animation: `${counterAnim} ${orbit.duration}s linear infinite`,
                    } as React.CSSProperties
                  }
                >
                  <OrbitIconImage
                    src={iconData.src}
                    alt={iconData.alt.endsWith('-mirror') ? '' : iconData.alt}
                    size={bubbleSize && Math.round(bubbleSize * 0.5)}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
