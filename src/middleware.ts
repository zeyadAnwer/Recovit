/**
 * Security headers for responses rendered by the Node server (form receipts
 * and Actions). Static pages get the same headers from nginx — see
 * deploy/nginx/recovik.conf — so both paths stay consistent. The page-level
 * Content-Security-Policy (with script/style hashes) is emitted by Astro as a
 * <meta> tag; the header below adds what a meta tag cannot carry.
 */
import { defineMiddleware } from 'astro:middleware';
import { SECURITY_HEADERS } from './lib/security-headers';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(name)) response.headers.set(name, value);
  }
  return response;
});
