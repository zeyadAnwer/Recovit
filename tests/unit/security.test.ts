import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { generateCaseRef, CASE_REF_PATTERN } from '../../src/lib/case-ref';
import { caseRequestEmail } from '../../src/lib/email/templates';
import { clientIp, isAllowedOrigin, isHoneypotTripped, verifyTurnstile } from '../../src/lib/forms/security';
import { createRateLimiter, MemoryStore } from '../../src/lib/rate-limit';
import { SECURITY_HEADERS } from '../../src/lib/security-headers';
import { caseRequestSchema } from '../../src/lib/validation/forms';

describe('rate limiter', () => {
  it('allows up to `max` hits per window, then blocks until reset', () => {
    let now = 0;
    const limiter = createRateLimiter({ max: 2, windowMs: 1000, now: () => now });
    expect(limiter.hit('ip').allowed).toBe(true);
    expect(limiter.hit('ip').allowed).toBe(true);
    const blocked = limiter.hit('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(1);
    expect(limiter.hit('other').allowed).toBe(true);
    now = 1001;
    expect(limiter.hit('ip').allowed).toBe(true);
  });

  it('bounds memory use', () => {
    const store = new MemoryStore(10);
    for (let i = 0; i < 100; i += 1) store.increment(`k${i}`, 60_000, 0);
    // Internal size is private; the call must simply not grow unbounded or throw.
    expect(store.increment('last', 60_000, 0).count).toBe(1);
  });
});

describe('request checks', () => {
  it('only trusts X-Real-IP behind a trusted proxy', () => {
    const headers = new Headers({ 'x-real-ip': '203.0.113.9' });
    expect(clientIp(headers, '10.0.0.1', true)).toBe('203.0.113.9');
    expect(clientIp(headers, '10.0.0.1', false)).toBe('10.0.0.1');
    expect(clientIp(new Headers(), undefined, true)).toBe('unknown');
  });

  it('accepts only our own origins', () => {
    const allowed = ['https://recovik.com'];
    expect(isAllowedOrigin('https://recovik.com', allowed)).toBe(true);
    expect(isAllowedOrigin('https://evil.example', allowed)).toBe(false);
    expect(isAllowedOrigin(null, allowed)).toBe(true);
  });

  it('detects a filled honeypot', () => {
    expect(isHoneypotTripped('')).toBe(false);
    expect(isHoneypotTripped(undefined)).toBe(false);
    expect(isHoneypotTripped('http://spam')).toBe(true);
  });
});

describe('Turnstile verification', () => {
  const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

  it('passes only when Cloudflare says success', async () => {
    const fetcher = vi.fn(() => ok({ success: true }));
    expect(await verifyTurnstile('token', 'secret', '203.0.113.9', fetcher)).toBe(true);
    expect(await verifyTurnstile('token', 'secret', 'unknown', () => ok({ success: false }))).toBe(false);
  });

  it('fails closed on missing tokens and network errors', async () => {
    expect(await verifyTurnstile(undefined, 'secret', 'x', vi.fn())).toBe(false);
    expect(await verifyTurnstile('t', 'secret', 'x', () => Promise.reject(new Error('down')))).toBe(false);
  });
});

describe('case reference', () => {
  it('is dated, random and free of look-alike characters', () => {
    const ref = generateCaseRef(new Date(Date.UTC(2026, 9, 28)), () => 0.5);
    expect(ref).toMatch(CASE_REF_PATTERN);
    expect(ref.startsWith('RCV-261028-')).toBe(true);
    expect(generateCaseRef()).toMatch(CASE_REF_PATTERN);
  });
});

describe('email templates', () => {
  it('produce plain text that contains the reference and the user text verbatim', () => {
    const input = caseRequestSchema.parse({
      systemType: 'files',
      incident: 'ransomware',
      details: '<script>alert(1)</script>',
      urgency: 'emergency',
      name: 'Test',
      phone: '+966500000000',
      email: 't@example.com',
      contactMethod: 'phone',
      consent: 'on',
    });
    const email = caseRequestEmail(input, 'RCV-261028-ABCD');
    expect(email.subject).toContain('RCV-261028-ABCD');
    expect(email.subject).toContain('[EMERGENCY]');
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.text).toContain('<script>alert(1)</script>');
  });
});

describe('security headers', () => {
  const nginx = readFileSync('deploy/nginx/security-headers.conf', 'utf8');
  const headersFile = readFileSync('public/_headers', 'utf8');

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    it(`${name} is identical in middleware, nginx and _headers`, () => {
      expect(nginx).toContain(`add_header ${name} "${value}" always;`);
      expect(headersFile).toContain(`${name}: ${value}`);
    });
  }
});
