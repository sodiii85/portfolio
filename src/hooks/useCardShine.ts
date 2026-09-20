import { useEffect, type RefObject } from 'react';

/* ============================================================
   Cursor-tracked stroke highlight.

   Writes the pointer position into --shine-x / --shine-y on the
   card; styles.css turns that into a highlight masked down to the
   1px border. Pointer-only: on touch there is no hover state to
   light up, so nothing is bound.

   A card can opt into a duotone version via data-shine-top /
   data-shine-bottom ("r,g,b" each) — the highlight colour then
   lerps between them by how far down the card the pointer is,
   written out as --shine-r/g/b for the CSS to build the gradient
   from. Plain cards skip this and keep their fixed colour.
   ============================================================ */

type Tint = [number, number, number] | null;

function parseTint(value: string | undefined): Tint {
  if (!value) return null;
  const parts = value.split(',').map(Number);
  return parts.length === 3 && parts.every((n) => !Number.isNaN(n))
    ? (parts as [number, number, number])
    : null;
}

export function useCardShine<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    let raf = 0;
    let pending: { x: number; y: number; height: number; top: Tint; bottom: Tint } | null = null;

    const apply = () => {
      raf = 0;
      if (!pending) return;
      const { x, y, height, top, bottom } = pending;
      card.style.setProperty('--shine-x', `${x}px`);
      card.style.setProperty('--shine-y', `${y}px`);
      if (top && bottom) {
        const t = Math.min(1, Math.max(0, y / height));
        for (let i = 0; i < 3; i++) {
          card.style.setProperty(
            `--shine-${'rgb'[i]}`,
            String(Math.round(top[i] + (bottom[i] - top[i]) * t))
          );
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      pending = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        height: rect.height,
        top: parseTint(card.dataset.shineTop),
        bottom: parseTint(card.dataset.shineBottom),
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    card.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      card.removeEventListener('pointermove', onPointerMove);
    };
  }, [ref]);
}
