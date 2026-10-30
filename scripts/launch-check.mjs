#!/usr/bin/env node
/**
 * Lists every placeholder the owner still has to fill before launch:
 * `[TOKENS]` in settings and content, photo placeholders and content
 * placeholders in pages. `pnpm launch:check --strict` exits with an error
 * while any remain (use it as a final gate before pointing recovik.com here).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const strict = process.argv.includes('--strict');
const TOKEN = /\[([A-Z][A-Z0-9_]{2,})\]/g;
const PHOTO = /<PhotoPlaceholder[^>]*subject="([^"]+)"/g;
const CONTENT = /<ContentPlaceholder[\s\S]*?token="([^"]+)"/g;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const findings = new Map();
const add = (key, file) => {
  const files = findings.get(key) ?? new Set();
  files.add(relative(ROOT, file).replaceAll('\\', '/'));
  findings.set(key, files);
};

for (const file of [join(ROOT, 'src/config/site.config.ts'), ...walk(join(ROOT, 'src/content'))]) {
  for (const match of readFileSync(file, 'utf8').matchAll(TOKEN)) add(`[${match[1]}]`, file);
}
for (const file of walk(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.astro'))) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(PHOTO)) add(`[PHOTO: ${match[1]}]`, file);
  for (const match of source.matchAll(CONTENT)) add(`[${match[1]}]`, file);
}

if (findings.size === 0) {
  console.log('✔ No placeholders left. Ready for launch.');
  process.exit(0);
}

console.log(`Placeholders to fill before launch (${findings.size}):\n`);
for (const [key, files] of [...findings].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`  ${key}\n      ${[...files].join('\n      ')}`);
}
console.log('\nSee docs/LAUNCH-CHECKLIST.md for what each one means.');
process.exit(strict ? 1 : 0);
