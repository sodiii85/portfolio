import { useEffect, useRef } from 'react';

interface ParticleSphereAnimationProps {
  /** Number of dots on the sphere surface. */
  particleCount?: number;
  /** Dot colour as "r,g,b". */
  color?: string;
  /** Radians per second around the vertical axis. */
  speed?: number;
  className?: string;
}

/* A rotating globe of dots drawn to a canvas. Points are laid out on a
   Fibonacci lattice so they cover the sphere evenly, then projected with
   depth-based size/opacity so the back hemisphere reads as fainter.
   Pauses while offscreen, and draws a single still frame when the user
   prefers reduced motion. */
export default function ParticleSphereAnimation({
  particleCount = 900,
  color = '111,117,237',
  speed = 0.18,
  className,
}: ParticleSphereAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const golden = Math.PI * (3 - Math.sqrt(5));
    const points = Array.from({ length: particleCount }, (_, i) => {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
    });

    const tilt = 0.35;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (angle: number) => {
      ctx.clearRect(0, 0, width, height);
      const radius = Math.min(width, height) * 0.46;
      const cx = width / 2;
      const cy = height / 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (const p of points) {
        // Spin around Y, then tilt around X so the poles aren't dead-on.
        const x1 = p.x * cosA - p.z * sinA;
        const z1 = p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;

        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        ctx.fillStyle = `rgba(${color},${0.12 + depth * 0.78})`;
        ctx.beginPath();
        ctx.arc(cx + x1 * radius, cy + y2 * radius, 0.6 + depth * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(angle);
    });
    resizeObserver.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let angle = 0;
    let frame = 0;
    let last = 0;
    let visible = true;

    const tick = (now: number) => {
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      angle += dt * speed;
      draw(angle);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduceMotion || frame) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    draw(angle);
    if (visible) start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [particleCount, color, speed]);

  return <canvas ref={canvasRef} className={className ?? 'block size-full'} aria-hidden="true" />;
}
