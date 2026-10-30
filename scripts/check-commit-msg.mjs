#!/usr/bin/env node
/**
 * commit-msg hook: enforces Conventional Commits, e.g.
 *   feat(forms): add Turnstile to the contact form
 *   fix: correct Arabic line height in the footer
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const message = file ? (readFileSync(file, 'utf8').split('\n')[0]?.trim() ?? '') : '';
const pattern =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|content)(\([\w./-]+\))?!?: .{3,}/;

if (!pattern.test(message) && !message.startsWith('Merge ')) {
  console.error(
    `Commit message must follow Conventional Commits:\n  type(scope): summary\n` +
      `Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, content\n` +
      `Got: "${message}"`,
  );
  process.exit(1);
}
