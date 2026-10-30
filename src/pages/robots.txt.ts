import type { APIRoute } from 'astro';

/** robots.txt — allow everything except form receipts; point to the sitemap. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /start-a-case/sent/',
    'Disallow: /contact/sent/',
    'Disallow: /en/start-a-case/sent/',
    'Disallow: /en/contact/sent/',
    'Disallow: /_actions/',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
