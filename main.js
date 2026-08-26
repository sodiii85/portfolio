/* Entry module: mounts the decorative background behind the page.
   Greyscale by design: the three colours are the neutrals already in
   styles.css (--slot bg, --text-faint, --text), so the waves read as
   part of the dark theme rather than a sticker on top of it. */

import { initGradientWaves } from './gradient-waves.js';
import { initCardShine } from './card-shine.js';

initGradientWaves(document.querySelector('[data-gradient-waves]'), {
  horizonColor: '#242424',
  waveColor: '#8B8B8B',
  crestColor: '#FFFFFF',
  speed: 0.3,
  amplitude: 2.5,
  waveScale: 0.6,
  waveRatio: 0.9,
  swell: 35,
  turbulence: 20,
  tilt: 1.11,
  zoom: 1.0,
  height: 5.5,
  fogDepth: 15,
  detail: 'medium',
  brightness: 0.9,
  opacity: 1.0,
  mouseInteraction: true,
  parallaxStrength: 0.5,
  grain: true,
  grainIntensity: 0.05,
});

initCardShine();
