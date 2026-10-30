/**
 * Request-level checks for form submissions. Pure functions where possible so
 * they can be unit-tested without a server.
 */

/**
 * The client IP used as the rate-limit key. Only trusts the proxy header when
 * TRUST_PROXY is on — i.e. when nginx (or another proxy we control) overwrites
 * `X-Real-IP` on every request. Never trust it on a directly exposed server.
 */
export function clientIp(headers: Headers, fallback: string | undefined, trustProxy: boolean): string {
  if (trustProxy) {
    const real = headers.get('x-real-ip')?.trim();
    if (real) return real;
  }
  return fallback ?? 'unknown';
}

/**
 * Defence in depth on top of Astro's `checkOrigin`: when the browser sends an
 * Origin header, it must be one of ours.
 */
export function isAllowedOrigin(origin: string | null, allowedOrigins: readonly string[]): boolean {
  if (!origin) return true; // Same-origin form posts from older browsers may omit it.
  return allowedOrigins.includes(origin);
}

/** A filled honeypot means a bot. */
export function isHoneypotTripped(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Verifies a Cloudflare Turnstile token server-side. Fails closed. */
export async function verifyTurnstile(
  token: string | null | undefined,
  secret: string,
  ip: string,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== 'unknown') body.set('remoteip', ip);
    const response = await fetcher(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: unknown };
    return result.success === true;
  } catch {
    return false;
  }
}
