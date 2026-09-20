/* ============================================================
   Card stack — 0 → 1 project showcase.

   Vanilla port of a shadcn/framer-motion "animated card stack"
   component the user provided. This project is vanilla JS + Vite
   — no React, TypeScript, Tailwind, shadcn, or framer-motion — so
   the stack swap is reimplemented with GSAP (already a dependency,
   see dot-grid.js) instead of pulling in a whole React/framer-motion
   stack for one card.

   Fourth trigger this component has had, and the reasoning behind
   each is worth keeping because the constraint that killed the
   earlier ones is still here. The source used a button click. A
   ScrollTrigger version came next, once the card grew to fill its
   whole bento slot with no button left to click — but this bento
   grid is deliberately a single non-scrolling screen at common
   desktop sizes (styles.css locks html/body overflow above
   1181x700), so with nothing to scroll the deck just sat at rest
   for most visitors. A plain interval loop replaced it, which did
   animate everywhere but took the deck out of the visitor's hands
   entirely — it advanced on its own schedule whether or not anyone
   was looking at it.

   This version is scroll-driven in both layouts, scrubbed rather
   than fired:

   - Scroll-locked layout (the >=1181x700 dashboard): a page-wide
     wheel listener. The page cannot scroll there, so wheel input is
     free to mean "advance the deck" no matter where the pointer is,
     and nothing needs preventDefault to stop it double-acting.
   - Scrolling layout (everything narrower/shorter): the section's
     own travel through the viewport. No ScrollTrigger import — the
     same rect maths in eight lines, and the wheel path needs the
     rAF smoothing loop anyway.

   Both feed one number, `target`, measured in *steps* (1.0 = one
   full card advance). `current` chases it each frame so raw wheel
   deltas come out as smooth motion, and every card position is a
   pure function of `current` — so scrolling back up genuinely runs
   the stack backwards instead of doing nothing.

   yPercent (not px) drives every offset so the peek amounts scale
   with the card's own height rather than a viewport size baked into
   the original component. .stack-card is 84% of .stack__viewport's
   height, bottom-anchored. That 84% is derived, not picked: the
   front card sits at yPercent 0 so its bottom is flush with the
   viewport's bottom edge (at the old +4% it hung 4% of its own
   height past the clip and .stack__viewport's overflow:hidden
   sliced its bottom border off), and the back card has to land
   flush with the *top* edge so the deck fills its bento slot to the
   same height as its row-mate .card--podcast. The back card's top
   sits at V - H - 0.24H + 0.05H (its -24% shift, then half the
   height that scale 0.9 gives back around its own centre); solving
   V - 1.19H = 0 gives H = 84%. Change any of yPercent, scale, or
   that height and the other two have to move with it.

   Depth is reinforced with a small blur increase per layer back,
   cleared as a card becomes the front one.

   The timeline rail beside the deck (index.html) is a second way
   into the same number: a click works out the *nearest* step whose
   front card is the project that was clicked — forward or backward,
   whichever is closer — and hands it to `target`, so a click and a
   scroll are the same gesture as far as the deck is concerned and
   can never disagree about where it is. Which node reads as active
   comes back out of `current` the same way, flipping at the halfway
   point of each transition rather than at either end of it.

   Only three DOM cards exist, so stepping recycles them rather than
   creating new ones: the exiting front card becomes the new back
   card, its title/description swapped to the next entry in a
   content array read from the markup itself at init (so the loop's
   copy can never drift from what's actually in index.html). With
   exactly as many entries as cards that swap is currently a no-op
   — it earns its keep the moment a fourth project is added.
   ============================================================ */

import { gsap } from 'gsap';

/* front → back. yPercent is a share of the card's own height; see
   the height derivation in the header comment before touching it. */
const POSITIONS = [
  { yPercent: 0, scale: 1, blur: 0 },
  { yPercent: -12, scale: 0.95, blur: 2 },
  { yPercent: -24, scale: 0.9, blur: 4 },
];
const EXIT = { yPercent: 140, scale: 1, blur: 0 };

/* Share of one step spent on the exit; the remainder slides the
   recycled card up into the back slot. Matches the 0.6s/0.4s split
   the timed version used. */
const EXIT_SPAN = 0.6;

const WHEEL_PER_STEP = 420; // px of wheel delta that equals one full advance
const SMOOTHING = 0.14; // per-frame chase toward `target`
const SETTLED = 0.0004; // steps; below this the rAF loop parks itself

/* Mirrors the fit-to-viewport breakpoint in styles.css. Inside it the
   page is overflow:hidden and cannot scroll, so the deck takes wheel
   input directly; outside it the page scrolls and drives the deck. */
const LOCKED_LAYOUT = '(min-width: 1181px) and (min-height: 700px)';

const ease = gsap.parseEase('power3.out');
const lerp = (a, b, t) => a + (b - a) * t;

export function initCardStack(root) {
  if (!root) return () => {};

  const cards = Array.from(root.querySelectorAll('[data-stack-card]'));
  if (cards.length < 3) return () => {};

  const content = cards.map((card) => ({
    title: card.querySelector('[data-stack-title]').textContent,
    description: card.querySelector('[data-stack-desc]').textContent,
  }));

  const applyContent = (card, entry) => {
    card.querySelector('[data-stack-title]').textContent = entry.title;
    card.querySelector('[data-stack-desc]').textContent = entry.description;
  };

  /* The rail's nodes are in project order, so node i is content[i].
     Its label is re-read from the card rather than trusted from the
     rail's own markup — index.html carries a copy for no-JS and for
     assistive tech, and this is what stops the two drifting. */
  const dots = Array.from(root.querySelectorAll('[data-stack-dot]'));
  dots.forEach((dot, i) => {
    const label = dot.querySelector('[data-stack-dot-label]');
    if (label && content[i]) label.textContent = content[i].title;
  });

  let order = cards.slice(); // front → back
  let contentCursor = cards.length - 1; // the back card already shows the last entry

  const place = (card, { yPercent, scale, blur }, zIndex) => {
    gsap.set(card, { yPercent, scale, filter: `blur(${blur}px)`, zIndex });
  };

  /* Every card position is a pure function of where we are inside the
     current step, which is what makes the scrub reversible. */
  const render = (frac) => {
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

    /* Past the exit the front card is well below .stack__viewport's
       clip, so it can be re-seeded as the incoming back card without
       the jump ever being visible — it emerges from behind the deck
       and slides up into the back slot. */
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

  /* Reduced motion doesn't mean a dead component — it means no
     scroll-linked movement and no easing. The scroll inputs stay
     unbound below and every jump lands in a single frame, but the
     rail still works and still says which project is showing. */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Step bookkeeping ────────────────────────────────────────
     `target` and `current` are measured in steps: the integer part
     says how many cards have gone past, the fraction is where we
     are inside the current transition. Rotation happens on integer
     crossings, in both directions, so an upward scroll unwinds the
     deck rather than stalling it. */
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

  const syncOrder = (step) => {
    while (appliedStep < step) {
      rotateForward();
      appliedStep += 1;
    }
    while (appliedStep > step) {
      rotateBack();
      appliedStep -= 1;
    }
  };

  /* ── Which project is at the front ───────────────────────────
     Pure function of the step count, so the rail can be derived
     from `current` instead of tracked alongside it. The three
     slots are always (cursor, cursor-1, cursor-2) back → front and
     the cursor starts at cards.length - 1, which is where the
     offset comes from; it is 0 for the three cards this deck
     actually has, and stays correct if a fourth is ever added. */
  const wrap = (n, m) => ((n % m) + m) % m;
  const FRONT_OFFSET = cards.length - 3;
  const frontIndexAt = (step) => wrap(step + FRONT_OFFSET, content.length);

  let activeIndex = -1;
  const markActive = (index) => {
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

  /* ── Frame loop ──────────────────────────────────────────────
     Runs only while `current` is still chasing `target`; input and
     scroll both kick it back awake. */
  let frameId = null;
  const tick = () => {
    frameId = null;
    const delta = target - current;
    current = reduced || Math.abs(delta) < SETTLED ? target : current + delta * SMOOTHING;

    const step = Math.floor(current);
    syncOrder(step);
    render(current - step);
    /* Math.round, not floor: the active node flips at the halfway
       point of a transition, which is roughly when the incoming card
       has visibly taken the front. */
    markActive(frontIndexAt(Math.round(current)));

    if (current !== target) frameId = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (frameId === null) frameId = requestAnimationFrame(tick);
  };

  /* ── Input: scroll-locked layout ─────────────────────────────
     No preventDefault — the page is overflow:hidden here, so this
     wheel input has nowhere else to go. deltaMode normalisation
     because Firefox still reports lines, not pixels. */
  const onWheel = (event) => {
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    target = Math.max(0, target + (event.deltaY * unit) / WHEEL_PER_STEP);
    kick();
  };

  /* ── Input: scrolling layout ─────────────────────────────────
     0 as the section enters from the bottom of the viewport, one
     step per card by the time it has left through the top. */
  const readScroll = () => {
    const rect = root.getBoundingClientRect();
    const span = window.innerHeight + rect.height;
    const travelled = (window.innerHeight - rect.top) / span;
    target = Math.min(Math.max(travelled, 0), 1) * cards.length;
    kick();
  };

  /* ── Input: the timeline rail ────────────────────────────────
     Runs the deck to the clicked project by the shorter way round —
     clicking the node just above the current one rewinds one card
     rather than crawling forward through the whole loop. The one
     exception is a backward route that would take `target` below 0,
     which is where the run starts and where the wheel path clamps;
     that falls back to going forward. */
  const jumpTo = (index) => {
    const base = Math.round(current);
    const ahead = wrap(index - FRONT_OFFSET - base, content.length);
    if (ahead === 0) return; // already the front card
    const behind = ahead - content.length;
    const backwardIsShorter = content.length - ahead < ahead;
    target = base + (backwardIsShorter && base + behind >= 0 ? behind : ahead);
    kick();
  };

  const onDotClick = (event) => {
    jumpTo(dots.indexOf(event.currentTarget));
  };
  dots.forEach((dot) => dot.addEventListener('click', onDotClick));

  /* ── Mode switching ──────────────────────────────────────────
     Which input is live follows the same media query the CSS uses,
     and re-evaluates on resize so a window drag across the
     breakpoint doesn't leave the deck listening to the wrong thing. */
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

  /* No point listening — or burning frames — while the deck is
     off-screen. */
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
}

export default initCardStack;
