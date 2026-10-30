import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';
import { buildBrandCss, buildFontPreloadModule } from './src/config/brand-css';
import { formatConfigIssues, siteConfigSchema } from './src/config/schema';
import { siteConfig } from './src/config/site.config';
import { precompress } from './src/integrations/precompress';

// Fail fast: a broken settings file must never reach a build.
const parsed = siteConfigSchema.safeParse(siteConfig);
if (!parsed.success) {
  throw new Error(`Invalid site settings:\n${formatConfigIssues(parsed.error)}`);
}

const { features, languages } = siteConfig;
const SITE_URL = process.env.SITE_URL || siteConfig.url;

if (features.captcha && !process.env.PUBLIC_TURNSTILE_SITE_KEY) {
  throw new Error(
    'site.config.ts enables `features.captcha` but PUBLIC_TURNSTILE_SITE_KEY is not set. ' +
      'Add the key to your environment or set `captcha: false`.',
  );
}

// Third-party origins are allowed by the CSP only when their feature is on.
const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';
const analyticsOrigins = !features.analytics.enabled
  ? { script: [], connect: [] }
  : features.analytics.provider === 'plausible'
    ? { script: ['https://plausible.io'], connect: ['https://plausible.io'] }
    : {
        script: ['https://static.cloudflareinsights.com'],
        connect: ['https://cloudflareinsights.com'],
      };
const captchaOrigins = features.captcha ? [TURNSTILE_ORIGIN] : [];
const join = (...lists: string[][]) => lists.flat().join(' ');

// Hosts allowed to arrive via the reverse proxy's X-Forwarded-Host header.
const allowedHosts = [
  ...new Set([new URL(SITE_URL).hostname, siteConfig.domain, `www.${siteConfig.domain}`]),
];

const BRAND_CSS_ID = 'virtual:recovik/brand.css';
const FONT_PRELOADS_ID = 'virtual:recovik/font-preloads';
const virtualModules: Record<string, () => string> = {
  [BRAND_CSS_ID]: () => buildBrandCss(siteConfig.brand),
  [FONT_PRELOADS_ID]: () => buildFontPreloadModule(siteConfig.brand),
};

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  // CSS is inlined (and hashed by the CSP): one round trip fewer before first paint.
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: false,
  // No server sessions are used; forms are stateless.
  session: false,
  // Shiki uses inline styles, which the CSP forbids. Content has no code blocks.
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },

  i18n: {
    locales: [...languages.supported],
    defaultLocale: languages.default,
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: languages.default,
        locales: Object.fromEntries(languages.supported.map((l) => [l, l])),
      },
      // Form receipts are not landing pages.
      filter: (page) => !/\/sent\/$/.test(page),
    }),
    precompress(),
  ],

  security: {
    checkOrigin: true,
    allowedDomains: allowedHosts.map((hostname) => ({ hostname, protocol: 'https' })),
    // Our forms are a few KB of text; anything bigger is not a real submission.
    actionBodySizeLimit: 64 * 1024,
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src ${join(["'self'"], analyticsOrigins.connect, captchaOrigins)}`,
        `frame-src ${captchaOrigins.length ? join(captchaOrigins) : "'none'"}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "manifest-src 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", ...analyticsOrigins.script, ...captchaOrigins],
      },
      styleDirective: { resources: ["'self'"] },
    },
  },

  env: {
    schema: {
      // `secret` = read at runtime (public server vars are inlined at build time).
      EMAIL_PROVIDER: envField.enum({
        context: 'server',
        access: 'secret',
        values: ['smtp', 'test'],
        default: 'smtp',
      }),
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 587 }),
      SMTP_SECURE: envField.boolean({ context: 'server', access: 'secret', default: false }),
      SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PASS: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'secret', default: 5, int: true }),
      RATE_LIMIT_WINDOW_SECONDS: envField.number({
        context: 'server',
        access: 'secret',
        default: 600,
        int: true,
      }),
      TRUST_PROXY: envField.boolean({ context: 'server', access: 'secret', default: false }),
    },
  },

  vite: {
    // Never inline assets as data: URIs — the CSP only allows fonts from 'self'.
    build: { assetsInlineLimit: 0 },
    plugins: [
      {
        // Brand tokens, fonts and font preloads generated from site.config.ts.
        name: 'recovik-brand',
        resolveId(id) {
          return id in virtualModules ? `\0${id}` : undefined;
        },
        load(id) {
          return id.startsWith('\0') ? virtualModules[id.slice(1)]?.() : undefined;
        },
      },
    ],
  },
});
