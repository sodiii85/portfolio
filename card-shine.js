/* ============================================================
   Cursor-tracked stroke highlight.

   Writes the pointer position into --shine-x / --shine-y on the
   card under the cursor; styles.css turns that into a highlight
   masked down to the 1px border. Pointer-only: on touch there is
   no hover state to light up, so nothing is bound.
   ============================================================ */

export function initCardShine(cards = document.querySelectorAll('.card')) {
  if (!window.matchMedia('(hover: hover)').matches) return () => {};

  let raf = 0;
  let pending = null;

  const apply = () => {
    raf = 0;
    if (!pending) return;
    const { card, x, y } = pending;
    card.style.setProperty('--shine-x', `${x}px`);
    card.style.setProperty('--shine-y', `${y}px`);
  };

  const onPointerMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    pending = { card, x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (!raf) raf = requestAnimationFrame(apply);
  };

  const bound = Array.from(cards);
  bound.forEach((card) => card.addEventListener('pointermove', onPointerMove, { passive: true }));

  return () => {
    if (raf) cancelAnimationFrame(raf);
    bound.forEach((card) => card.removeEventListener('pointermove', onPointerMove));
  };
}

export default initCardShine;
