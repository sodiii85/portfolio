/* Entry module: mounts the decorative background behind the page and the
   pointer-driven polish on top of it. */

import { initCardShine } from './card-shine.js';
import { initCardStack } from './card-stack.js';
import { initDotGrid } from './dot-grid.js';
import { initWorldConnections } from './world-connections.js';

initCardShine();
initCardStack(document.querySelector('[data-stack]'));
initWorldConnections(document.querySelector('[data-connections]'));

/* Dot lattice behind the page: it tints toward white near the cursor,
   scatters when the pointer whips past, and takes a shockwave on click.
   The glass cards blur whatever sits behind them, so the dots read as
   texture under the bento and as a crisp lattice in the gutters. */
initDotGrid(document.querySelector('[data-dot-grid]'), {
  dotSize: 3,
  gap: 24,
  baseColor: '#2E2E2E',
  activeColor: '#EDEDED',
  proximity: 130,
  speedTrigger: 100,
  shockRadius: 220,
  shockStrength: 4,
  resistance: 650,
  returnDuration: 1.4,
});
