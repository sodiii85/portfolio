import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';

/* ============================================================
   Card stack — 0 → 1 project showcase.

   Direct port of the vanilla card-stack.js scroll-scrub logic
   (see legacy/card-stack.js for the full derivation notes on the
   84% card height, the yPercent/scale/blur positions, and the two
   input modes). Ref-driven instead of document.querySelector, but
   the algorithm itself is unchanged — porting it to React state
   would rewrite working, carefully-tuned scroll math for no
   behavioural gain.
   ============================================================ */

const POSITIONS = [
  { yPercent: 0, scale: 1, blur: 0 },
  { yPercent: -12, scale: 0.95, blur: 2 },
  { yPercent: -24, scale: 0.9, blur: 4 },
];
const EXIT = { yPercent: 140, scale: 1, blur: 0 };

const EXIT_SPAN = 0.6;
const WHEEL_PER_STEP = 420;
const SMOOTHING = 0.14;
const SETTLED = 0.0004;

const LOCKED_LAYOUT = '(min-width: 1181px) and (min-height: 700px)';

const ease = gsap.parseEase('power3.out');
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function useCardStack(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-stack-card]'));
    if (cards.length < 3) return;

    const content = cards.map((card) => ({
      title: card.querySelector('[data-stack-title]')!.textContent ?? '',
      description: card.querySelector('[data-stack-desc]')!.textContent ?? '',
    }));

    const applyContent = (card: HTMLElement, entry: { title: string; description: string }) => {
      card.querySelector('[data-stack-title]')!.textContent = entry.title;
      card.querySelector('[data-stack-desc]')!.textContent = entry.description;
    };

    const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-stack-dot]'));
    dots.forEach((dot, i) => {
      const label = dot.querySelector('[data-stack-dot-label]');
      if (label && content[i]) label.textContent = content[i].title;
    });

    let order = cards.slice();
    let contentCursor = cards.length - 1;

    const place = (
      card: HTMLElement,
      { yPercent, scale, blur }: { yPercent: number; scale: number; blur: number },
      zIndex: number
    ) => {
      gsap.set(card, { yPercent, scale, filter: `blur(${blur}px)`, zIndex });
    };

    const render = (frac: number) => {
      const [front, mid, back] = order;

      if (frac <= EXIT_SPAN) {
        const t = ease(frac / EXIT_SPAN);
        place(
          front,
          {
            yPercent: lerp(POSITIONS[0].yPercent, EXIT.yPercent, t),
            scale: lerp(POSITIONS[0].scale, EXIT.scale, t),
            blur: lerp(POSITIONS[0].blur, EXIT.blur, t),
          },
          10
        );
        place(
          mid,
          {
            yPercent: lerp(POSITIONS[1].yPercent, POSITIONS[0].yPercent, t),
            scale: lerp(POSITIONS[1].scale, POSITIONS[0].scale, t),
            blur: lerp(POSITIONS[1].blur, POSITIONS[0].blur, t),
          },
          9
        );
        place(
          back,
          {
            yPercent: lerp(POSITIONS[2].yPercent, POSITIONS[1].yPercent, t),
            scale: lerp(POSITIONS[2].scale, POSITIONS[1].scale, t),
            blur: lerp(POSITIONS[2].blur, POSITIONS[1].blur, t),
          },
          8
        );
        return;
      }

      const t = ease((frac - EXIT_SPAN) / (1 - EXIT_SPAN));
      place(
        front,
        {
          yPercent: lerp(POSITIONS[1].yPercent, POSITIONS[2].yPercent, t),
          scale: POSITIONS[2].scale,
          blur: POSITIONS[2].blur,
        },
        1
      );
      place(mid, POSITIONS[0], 10);
      place(back, POSITIONS[1], 9);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target = 0;
    let current = 0;
    let appliedStep = 0;

    const rotateForward = () => {
      order = [order[1], order[2], order[0]];
      contentCursor = (contentCursor + 1) % content.length;
      applyContent(order[2], content[contentCursor]);
    };

    const rotateBack = () => {
      order = [order[2], order[0], order[1]];
      contentCursor = (contentCursor - 1 + content.length) % content.length;
      applyContent(order[0], content[(contentCursor - 2 + content.length) % content.length]);
    };

    const syncOrder = (step: number) => {
      while (appliedStep < step) {
        rotateForward();
        appliedStep += 1;
      }
      while (appliedStep > step) {
        rotateBack();
        appliedStep -= 1;
      }
    };

    const wrap = (n: number, m: number) => ((n % m) + m) % m;
    const FRONT_OFFSET = cards.length - 3;
    const frontIndexAt = (step: number) => wrap(step + FRONT_OFFSET, content.length);

    let activeIndex = -1;
    const markActive = (index: number) => {
      if (index === activeIndex) return;
      activeIndex = index;
      dots.forEach((dot, i) => {
        const on = i === index;
        dot.classList.toggle('is-active', on);
        if (on) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };

    order.forEach((card, i) => place(card, POSITIONS[i], 10 - i));
    markActive(frontIndexAt(0));

    let frameId: number | null = null;
    const tick = () => {
      frameId = null;
      const delta = target - current;
      current = reduced || Math.abs(delta) < SETTLED ? target : current + delta * SMOOTHING;

      const step = Math.floor(current);
      syncOrder(step);
      render(current - step);
      markActive(frontIndexAt(Math.round(current)));

      if (current !== target) frameId = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (frameId === null) frameId = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      target = Math.max(0, target + (event.deltaY * unit) / WHEEL_PER_STEP);
      kick();
    };

    const readScroll = () => {
      const rect = root.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      const travelled = (window.innerHeight - rect.top) / span;
      target = Math.min(Math.max(travelled, 0), 1) * cards.length;
      kick();
    };

    const jumpTo = (index: number) => {
      const base = Math.round(current);
      const ahead = wrap(index - FRONT_OFFSET - base, content.length);
      if (ahead === 0) return;
      const behind = ahead - content.length;
      const backwardIsShorter = content.length - ahead < ahead;
      target = base + (backwardIsShorter && base + behind >= 0 ? behind : ahead);
      kick();
    };

    const onDotClick = (event: MouseEvent) => {
      jumpTo(dots.indexOf(event.currentTarget as HTMLElement));
    };
    dots.forEach((dot) => dot.addEventListener('click', onDotClick));

    const locked = window.matchMedia(LOCKED_LAYOUT);
    let listening = false;
    let visible = false;

    const detach = () => {
      if (!listening) return;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', readScroll);
      listening = false;
    };
    const attach = () => {
      detach();
      if (!visible || reduced) return;
      if (locked.matches) {
        window.addEventListener('wheel', onWheel, { passive: true });
      } else {
        window.addEventListener('scroll', readScroll, { passive: true });
        readScroll();
      }
      listening = true;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        attach();
      },
      { threshold: 0.1 }
    );
    observer.observe(root);

    const onModeChange = () => attach();
    locked.addEventListener('change', onModeChange);

    return () => {
      detach();
      dots.forEach((dot) => dot.removeEventListener('click', onDotClick));
      locked.removeEventListener('change', onModeChange);
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
      gsap.killTweensOf(cards);
    };
  }, [rootRef]);
}
