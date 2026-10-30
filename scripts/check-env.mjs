#!/usr/bin/env node
/**
 * Fail-fast environment check, run by systemd (ExecStartPre) before the Node
 * server starts. astro:env validates types on access; this script makes sure
 * the secrets production needs are present *before* we accept traffic.
 * Prints variable names only — never values.
 */
const env = process.env;
const problems = [];

const provider = env.EMAIL_PROVIDER ?? 'smtp';
if (!['smtp', 'test'].includes(provider)) problems.push('EMAIL_PROVIDER must be "smtp" or "test"');

if (provider === 'smtp') {
  for (const name of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM']) {
    if (!env[name]?.trim()) problems.push(`${name} is required when EMAIL_PROVIDER=smtp`);
  }
  if (env.SMTP_PORT && !/^\d+$/.test(env.SMTP_PORT)) problems.push('SMTP_PORT must be a number');
}

if (env.NODE_ENV === 'production' && provider === 'test') {
  problems.push('EMAIL_PROVIDER=test would silently drop customer requests in production');
}

for (const name of ['RATE_LIMIT_MAX', 'RATE_LIMIT_WINDOW_SECONDS']) {
  if (env[name] && !/^\d+$/.test(env[name])) problems.push(`${name} must be a whole number`);
}

if (problems.length > 0) {
  console.error(`Environment check failed:\n${problems.map((p) => `  • ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('Environment check passed.');
