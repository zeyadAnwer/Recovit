#!/usr/bin/env node
/**
 * Generates the brand files into public/ from one geometry:
 *   public/brand/  mark + lockups (Latin, bilingual) in light, dark and mono
 *   public/        favicon.svg, favicon.ico (16/32/48), PNG icons 16–512
 *   public/og/     Open Graph images (ar: bilingual, en: Latin)
 * Run after changing colours, the mark or the wordmarks:  pnpm assets
 * Wordmark outlines come from scripts/brand/wordmarks.json (see
 * outline-wordmarks.py) so logo files never depend on installed fonts.
 * OG taglines are set with system fonts by librsvg (Arabic needs a font with
 * Arabic glyphs: Segoe UI on Windows, Noto Sans Arabic on Linux).
 */
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const words = JSON.parse(readFileSync(new URL('./brand/wordmarks.json', import.meta.url), 'utf8'));

const LIGHT = { paper: '#F4F6F5', ink: '#0C1B26', muted: '#4A5865', accent: '#0A7258', line: '#DCE2E5' };
const DARK = { paper: '#08121A', ink: '#E6EDF1', muted: '#9AA9B5', accent: '#3CC9A0', line: '#1F2F3B' };

/** The "Restore R" on a 32-unit grid. */
const markPaths = (ink, accent) => `
  <g fill="none" stroke="${ink}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 27V5.5h8a7 7 0 0 1 0 14h-2.5"/>
    <path d="M16.4 16.8l-2.6 2.7 2.6 2.7"/>
    <path d="M19.2 19.9l5.3 7.1"/>
  </g>
  <rect x="14.2" y="10.2" width="4.6" height="4.6" rx="1" fill="${accent}"/>`;

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const mark = (c) => svg(32, 32, markPaths(c.ink, c.accent), 'Recovik');

/** Horizontal Latin lockup: mark + "Recovik". */
function lockupLatin(c) {
  const h = 40;
  const w = Math.ceil(40 + 10 + words.latin.width + 2);
  const body = `<g transform="translate(0 4)">${markPaths(c.ink, c.accent)}</g>
    <path transform="translate(50 30)" fill="${c.ink}" d="${words.latin.d}"/>`;
  return svg(w, h, body, 'Recovik');
}

/** Bilingual lockup: Arabic name primary, Latin name small beneath, start-aligned to the right of the mark. */
function lockupBilingual(c) {
  const textW = Math.max(words.arabic.width, words.latinSmall.width);
  const w = Math.ceil(44 + 12 + textW + 2);
  const h = 52;
  const body = `<g transform="translate(0 6) scale(1.25)">${markPaths(c.ink, c.accent)}</g>
    <path transform="translate(56 30)" fill="${c.ink}" d="${words.arabic.d}"/>
    <path transform="translate(56 47)" fill="${c.muted}" d="${words.latinSmall.d}"/>`;
  return svg(w, h, body, 'ريكوفِك Recovik');
}

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<style>.i{stroke:${LIGHT.ink}}.a{fill:${LIGHT.accent}}@media (prefers-color-scheme:dark){.i{stroke:${DARK.ink}}.a{fill:${DARK.accent}}}</style>
<g class="i" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 27V5.5h8a7 7 0 0 1 0 14h-2.5"/><path d="M16.4 16.8l-2.6 2.7 2.6 2.7"/><path d="M19.2 19.9l5.3 7.1"/></g>
<rect class="a" x="14.2" y="10.2" width="4.6" height="4.6" rx="1"/>
</svg>
`;

/** Square app icon: mark on a paper tile with safe padding. */
const tile = (pad = 4) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${32 + 2 * pad} ${32 + 2 * pad}"><rect x="${-pad}" y="${-pad}" width="${32 + 2 * pad}" height="${32 + 2 * pad}" fill="${LIGHT.paper}"/>${markPaths(LIGHT.ink, LIGHT.accent)}</svg>`;

const png = (source, size) =>
  sharp(Buffer.from(source), { density: 1200 }).resize(size, size).png({ compressionLevel: 9 });

function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size, e);
    header.writeUInt8(size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

function og(lang) {
  const c = LIGHT;
  const rtl = lang === 'ar';
  const family = "'Segoe UI', 'Noto Sans Arabic', 'Noto Sans', Arial, sans-serif";
  const tagline = rtl ? 'خبراء استعادة البيانات' : 'Data Recovery Experts';
  const line = rtl
    ? 'فك تشفير الفدية · استعادة المحذوف · التحقيق الرقمي'
    : 'Ransomware decryption · Deleted data · Digital forensics';
  // Lockup scaled ×3, anchored to the start edge (right for Arabic).
  const scale = 3;
  const lockW = rtl ? 56 + Math.max(words.arabic.width, words.latinSmall.width) : 50 + words.latin.width;
  const x0 = rtl ? 1110 - lockW * scale : 90;
  const lockup = rtl
    ? `<g transform="translate(${x0} 120) scale(${scale})"><g transform="translate(0 6) scale(1.25)">${markPaths(c.ink, c.accent)}</g><path transform="translate(56 30)" fill="${c.ink}" d="${words.arabic.d}"/><path transform="translate(56 47)" fill="${c.muted}" d="${words.latinSmall.d}"/></g>`
    : `<g transform="translate(${x0} 130) scale(${scale})"><g transform="translate(0 4)">${markPaths(c.ink, c.accent)}</g><path transform="translate(50 30)" fill="${c.ink}" d="${words.latin.d}"/></g>`;
  const tx = rtl ? 1110 : 90;
  const textAttrs = rtl ? 'direction="rtl" text-anchor="start"' : 'text-anchor="start"';
  // Decorative restored-file grid on the opposite edge.
  const gx = rtl ? 90 : 830;
  const cells = Array.from({ length: 12 }, (_, i) => {
    const x = gx + (i % 4) * 72;
    const y = 360 + Math.floor(i / 4) * 72;
    const restored = i !== 6;
    return `<rect x="${x}" y="${y}" width="60" height="60" rx="8" fill="${restored ? '#E3F1EC' : '#F7E4DF'}" stroke="${restored ? c.accent : '#B4361C'}" stroke-width="2"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${c.paper}"/>
  <rect x="0" y="0" width="1200" height="10" fill="${c.accent}"/>
  ${lockup}
  <text x="${tx}" y="380" font-family="${family}" font-weight="700" font-size="58" fill="${c.ink}" ${textAttrs}>${tagline}</text>
  <text x="${tx}" y="450" font-family="${family}" font-size="28" fill="${c.muted}" ${textAttrs}>${line}</text>
  <text x="${tx}" y="560" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="22" fill="${c.muted}" ${textAttrs} letter-spacing="3">RECOVIK.COM</text>
  ${cells}
</svg>`;
}

await mkdir('public/brand', { recursive: true });
await mkdir('public/og', { recursive: true });

const files = {
  'recovik-mark.svg': mark(LIGHT),
  'recovik-mark-dark.svg': mark(DARK),
  'recovik-mark-mono.svg': svg(32, 32, markPaths('#000000', '#000000'), 'Recovik'),
  'recovik-lockup-en.svg': lockupLatin(LIGHT),
  'recovik-lockup-en-dark.svg': lockupLatin(DARK),
  'recovik-lockup-en-mono.svg': lockupLatin({ ...LIGHT, ink: '#000000', accent: '#000000' }),
  'recovik-lockup-bilingual.svg': lockupBilingual(LIGHT),
  'recovik-lockup-bilingual-dark.svg': lockupBilingual(DARK),
  'recovik-lockup-bilingual-mono.svg': lockupBilingual({
    ...LIGHT,
    ink: '#000000',
    muted: '#000000',
    accent: '#000000',
  }),
};
for (const [name, content] of Object.entries(files)) await writeFile(`public/brand/${name}`, content);
await writeFile('public/favicon.svg', faviconSvg);

// Small sizes use a tighter tile so the mark stays legible at 16px.
const icons = {};
for (const size of [16, 32, 48]) icons[size] = await png(tile(1), size).toBuffer();
for (const size of [16, 32, 48]) await writeFile(`public/favicon-${size}.png`, icons[size]);
await writeFile('public/favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: icons[size] }))));
await png(tile(4), 180).toFile('public/apple-touch-icon.png');
await png(tile(4), 192).toFile('public/icon-192.png');
await png(tile(4), 512).toFile('public/icon-512.png');

for (const lang of ['ar', 'en']) {
  await sharp(Buffer.from(og(lang)))
    .png({ compressionLevel: 9 })
    .toFile(`public/og/${lang}.png`);
}

await writeFile(
  'public/site.webmanifest',
  `${JSON.stringify(
    {
      name: 'Recovik — ريكوفِك',
      short_name: 'Recovik',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: LIGHT.paper,
      background_color: LIGHT.paper,
      display: 'browser',
    },
    null,
    2,
  )}\n`,
);

console.log('Brand assets written to public/.');
