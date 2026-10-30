/**
 * Scroll reveal and the process progress line.
 *
 * - `[data-reveal]` elements fade in once when they enter the viewport.
 *   They are only hidden when the `.js` class is present (set in <head>), so
 *   content is always visible without JavaScript.
 * - `[data-progress]` elements receive a `--progress` value (0–1) as the user
 *   scrolls past them; CSS draws the filling line from it.
 * Both are skipped entirely under `prefers-reduced-motion`.
 */
import { progressFor } from './reveal-math';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealAll(elements: NodeListOf<Element>): void {
  for (const element of elements) element.classList.add('is-revealed');
}

function initReveal(): void {
  const elements = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll(elements);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  for (const element of elements) observer.observe(element);
}

function initProgress(): void {
  const tracks = [...document.querySelectorAll<HTMLElement>('[data-progress]')];
  if (tracks.length === 0) return;
  if (reduceMotion) {
    for (const track of tracks) track.style.setProperty('--progress', '1');
    return;
  }
  let queued = false;
  const update = () => {
    queued = false;
    for (const track of tracks) {
      const value = progressFor(track.getBoundingClientRect(), window.innerHeight);
      track.style.setProperty('--progress', value.toFixed(3));
    }
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

initReveal();
initProgress();
