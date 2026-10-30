import type { APIRoute } from 'astro';
import { site } from '../../config';

/**
 * RFC 9116 security.txt. `Expires` is set one year after each build, so a
 * deployment at least once a year keeps it valid.
 */
export const GET: APIRoute = ({ site: siteUrl }) => {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  const body = [
    `Contact: mailto:${site.securityContact}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: ar, en',
    `Canonical: ${new URL('/.well-known/security.txt', siteUrl).toString()}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
