/**
 * Marks the header as scrolled so CSS can compact it and add a subtle
 * background and border. One passive listener, throttled to one frame.
 */
const header = document.querySelector<HTMLElement>('[data-header]');

if (header) {
  let queued = false;
  const update = () => {
    queued = false;
    header.toggleAttribute('data-scrolled', window.scrollY > 8);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
