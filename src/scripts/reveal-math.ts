/** Pure helpers for scripts/reveal.ts, kept separate so they can be unit-tested. */

/** 0 when the element's top reaches 75% of the viewport, 1 when its bottom does. */
export function progressFor(rect: { top: number; height: number }, viewportHeight: number): number {
  const start = viewportHeight * 0.75;
  const travelled = start - rect.top;
  const ratio = rect.height > 0 ? travelled / rect.height : 1;
  return Math.min(1, Math.max(0, ratio));
}
