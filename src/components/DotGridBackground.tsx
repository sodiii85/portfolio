import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(InertiaPlugin);

/* ============================================================
   DotGrid — canvas dot field that reacts to the pointer.

   Direct port of the vanilla dot-grid.js (itself a port of the
   React Bits <DotGrid /> component). Grid maths, proximity tint,
   inertia push and click shockwave are unchanged; only the
   mount/teardown moved from an init()-returns-teardown function
   into a useEffect on this component's own container ref.
   ============================================================ */

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

export interface DotGridOptions {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  baseOpacity?: number;
  activeOpacity?: number;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
}

const DEFAULTS: Required<DotGridOptions> = {
  dotSize: 16,
  gap: 32,
  baseColor: '#5227FF',
  activeColor: '#5227FF',
  baseOpacity: 1,
  activeOpacity: 1,
  proximity: 150,
  speedTrigger: 100,
  shockRadius: 250,
  shockStrength: 5,
  maxSpeed: 5000,
  resistance: 750,
  returnDuration: 1.5,
};

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function throttle<A extends unknown[]>(func: (...args: A) => void, limit: number) {
  let lastCall = 0;
  return (...args: A) => {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

export function DotGridBackground({ options = {} }: { options?: DotGridOptions }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === 'undefined' || !window.Path2D) return;

    const opts = { ...DEFAULTS, ...options };
    const {
      dotSize,
      gap,
      baseColor,
      activeColor,
      baseOpacity,
      activeOpacity,
      proximity,
      speedTrigger,
      shockRadius,
      shockStrength,
      maxSpeed,
      resistance,
      returnDuration,
    } = opts;

    const canvas = document.createElement('canvas');
    canvas.className = 'dot-grid__canvas';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    container.appendChild(canvas);

    const baseRgb = hexToRgb(baseColor);
    const activeRgb = hexToRgb(activeColor);
    const circlePath = new window.Path2D();
    circlePath.arc(0, 0, dotSize / 2, 0, Math.PI * 2);

    let dots: Dot[] = [];
    const pointer = { x: -1e5, y: -1e5, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };

    const buildGrid = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.floor((width + gap) / (dotSize + gap));
      const rows = Math.floor((height + gap) / (dotSize + gap));
      const cell = dotSize + gap;

      const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2;
      const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;

      const next: Dot[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          next.push({
            cx: startX + x * cell,
            cy: startY + y * cell,
            xOffset: 0,
            yOffset: 0,
            _inertiaApplied: false,
          });
        }
      }
      dots.forEach((dot) => gsap.killTweensOf(dot));
      dots = next;
    };

    const proxSq = proximity * proximity;

    const draw = () => {
      const { width, height } = canvas;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.restore();

      const { x: px, y: py } = pointer;

      for (const dot of dots) {
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let style = `rgba(${baseRgb.r},${baseRgb.g},${baseRgb.b},${baseOpacity})`;
        if (dsq <= proxSq) {
          const t = 1 - Math.sqrt(dsq) / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          const a = baseOpacity + (activeOpacity - baseOpacity) * t;
          style = `rgba(${r},${g},${b},${a})`;
        }

        ctx.save();
        ctx.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset);
        ctx.fillStyle = style;
        ctx.fill(circlePath);
        ctx.restore();
      }
    };

    const ro = new ResizeObserver(() => {
      buildGrid();
      draw();
    });
    ro.observe(container);
    buildGrid();
    draw();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      return () => {
        ro.disconnect();
        dots.forEach((dot) => gsap.killTweensOf(dot));
        container.removeChild(canvas);
      };
    }

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    let dirty = true;
    let wasAnimating = false;

    const loop = () => {
      const animating = dots.some((dot) => dot.xOffset !== 0 || dot.yOffset !== 0);
      if (dirty || animating || wasAnimating) {
        draw();
        dirty = false;
      }
      wasAnimating = animating;
      raf = requestAnimationFrame(loop);
    };
    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const flick = (dot: Dot, pushX: number, pushY: number) => {
      dot._inertiaApplied = true;
      gsap.killTweensOf(dot);
      gsap.to(dot, {
        inertia: { xOffset: pushX, yOffset: pushY, resistance },
        onComplete: () => {
          gsap.to(dot, {
            xOffset: 0,
            yOffset: 0,
            duration: returnDuration,
            ease: 'elastic.out(1,0.75)',
          });
          dot._inertiaApplied = false;
        },
      });
    };

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const dt = pointer.lastTime ? now - pointer.lastTime : 16;
      let vx = ((event.clientX - pointer.lastX) / dt) * 1000;
      let vy = ((event.clientY - pointer.lastY) / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      pointer.lastTime = now;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.vx = vx;
      pointer.vy = vy;
      pointer.speed = speed;

      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      dirty = true;

      for (const dot of dots) {
        const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);
        if (speed > speedTrigger && dist < proximity && !dot._inertiaApplied) {
          flick(dot, dot.cx - pointer.x + vx * 0.005, dot.cy - pointer.y + vy * 0.005);
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      for (const dot of dots) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          const falloff = Math.max(0, 1 - dist / shockRadius);
          flick(
            dot,
            (dot.cx - cx) * shockStrength * falloff,
            (dot.cy - cy) * shockStrength * falloff
          );
        }
      }
    };

    const throttledMove = throttle(onMove, 50);
    const clickTarget: Element | Window = container.closest('.card') || window;
    window.addEventListener('pointermove', throttledMove, { passive: true });
    clickTarget.addEventListener('click', onClick as EventListener);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? tryStart() : tryStop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', throttledMove);
      clickTarget.removeEventListener('click', onClick as EventListener);
      dots.forEach((dot) => gsap.killTweensOf(dot));
      try {
        container.removeChild(canvas);
      } catch {
        /* already detached */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="dot-grid" ref={containerRef} data-dot-grid aria-hidden="true" />;
}
