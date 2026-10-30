#!/usr/bin/env node
/**
 * Full-page screenshots of every page × language × theme × width.
 *
 *   pnpm build && node scripts/screenshots.mjs <outDir> [--widths=375,1366] [--pages=/,/faq/] [--format=jpeg]
 *
 * Starts the production server (dist/server/entry.mjs) on port 4600.
 * Set PW_EXECUTABLE to use an installed Chrome instead of Playwright's.
 * File names: <lang>_<page>_<width>_<theme>.<ext>, e.g. ar_home_1366_light.jpeg
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const args = Object.fromEntries(
  process.argv
    .slice(3)
    .filter((a) => a.startsWith('--'))
    .map((a) => a.slice(2).split('=')),
);
const outDir = process.argv[2] ?? 'screenshots';
const WIDTHS = (args.widths ?? '375,768,1280,1366,1440,1536,1920').split(',').map(Number);
const PAGES = (
  args.pages ??
  '/,/services/,/services/ransomware-recovery/,/sectors/,/process/,/about/,/faq/,/start-a-case/,/contact/,/privacy/,/terms/'
).split(',');
const THEMES = (args.themes ?? 'light,dark').split(',');
const LANGS = (args.langs ?? 'ar,en').split(',');
const FORMAT = args.format === 'png' ? 'png' : 'jpeg';
const PORT = 4600;
const BASE = `http://localhost:${PORT}`;

const server = spawn(process.execPath, ['dist/server/entry.mjs'], {
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(PORT), EMAIL_PROVIDER: 'test' },
  stdio: 'ignore',
});
await new Promise((resolve) => setTimeout(resolve, 2000));

const browser = await chromium.launch(
  process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {},
);
await mkdir(outDir, { recursive: true });
let count = 0;
try {
  for (const lang of LANGS) {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          reducedMotion: 'reduce',
        });
        await context.addInitScript((t) => localStorage.setItem('recovik-theme', t), theme);
        const page = await context.newPage();
        for (const path of PAGES) {
          const url = BASE + (lang === 'ar' ? path : `/en${path}`);
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);
          const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replaceAll('/', '-');
          const file = `${outDir}/${lang}_${slug}_${width}_${theme}.${FORMAT}`;
          await page.screenshot({
            path: file,
            fullPage: true,
            ...(FORMAT === 'jpeg' ? { quality: 70 } : {}),
          });
          count += 1;
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`${count} screenshots written to ${outDir}`);
