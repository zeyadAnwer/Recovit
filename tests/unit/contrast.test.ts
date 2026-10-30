/**
 * WCAG 2.2 AA contrast for the brand palette in both themes. Change a colour
 * in site.config.ts and this test tells you if it breaks accessibility.
 */
import { describe, expect, it } from 'vitest';
import { site } from '../../src/config';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe.each(['light', 'dark'] as const)('%s theme', (theme) => {
  const p = site.brand[theme];

  it.each([
    ['ink on paper', p.ink, p.paper],
    ['ink on surface', p.ink, p.surface],
    ['muted on paper', p.muted, p.paper],
    ['muted on surface', p.muted, p.surface],
    ['secondary on paper', p.secondary, p.paper],
    ['secondary on surface', p.secondary, p.surface],
    ['accent on paper (labels, links)', p.accent, p.paper],
    ['button text on accent', p.accentInk, p.accent],
    ['paper on ink (emergency strip)', p.paper, p.ink],
    ['paper on secondary (WhatsApp, receipt icon)', p.paper, p.secondary],
    ['alert on paper (incident labels)', p.alert, p.paper],
    ['text on alert (emergency button)', p.alertInk, p.alert],
    ['accent on surface', p.accent, p.surface],
  ])('%s ≥ 4.5:1', (_label, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it('form field borders reach 3:1 (WCAG 1.4.11, non-text contrast)', () => {
    // --color-line-strong in tokens.css is ink mixed 55% into paper.
    const mix = (fg: string, bg: string, ratio: number) =>
      `#${[1, 3, 5]
        .map((i) => {
          const value = Math.round(
            parseInt(fg.slice(i, i + 2), 16) * ratio + parseInt(bg.slice(i, i + 2), 16) * (1 - ratio),
          );
          return value.toString(16).padStart(2, '0');
        })
        .join('')}`;
    const strong = mix(p.ink, p.paper, 0.55);
    expect(contrast(strong, p.surface)).toBeGreaterThanOrEqual(3);
  });
});
