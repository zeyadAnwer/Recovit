/**
 * The HTTP security headers every response must carry. Single source for the
 * middleware; a unit test (tests/unit/security-headers.test.ts) checks that the
 * nginx config and public/_headers (Netlify/Cloudflare Pages) carry them too.
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  // Directives a <meta> CSP cannot express; the meta CSP adds script/style hashes.
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
} as const;
