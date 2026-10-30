/**
 * Lighthouse CI: mobile emulation, both languages, budgets that fail the
 * build below 95 in any category. Dark theme is covered by the same pages
 * because the theme is client-side only (same HTML, same assets); its
 * contrast is verified by axe in the e2e suite and by the unit contrast test.
 */
const BASE = 'http://127.0.0.1:4500';
const paths = ['/', '/services/ransomware-recovery/', '/start-a-case/', '/faq/'];

module.exports = {
  ci: {
    collect: {
      // CI starts nginx (deploy/nginx/ci.conf) on :4500 in front of the Node
      // server, so pages are measured gzip-compressed, exactly as in production.
      url: [...paths.map((p) => BASE + p), ...paths.map((p) => `${BASE}/en${p}`)],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75 },
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 30720 }],
        // Served over plain HTTP locally; HTTPS is enforced by nginx in production.
        'is-on-https': 'off',
        'redirects-http': 'off',
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
