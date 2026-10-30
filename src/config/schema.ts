/**
 * Zod schema for `site.config.ts`. Validation runs when the config module is
 * first imported during the build, so a malformed phone number or a missing
 * translation stops the build with a readable error.
 */
import { z } from 'astro/zod';
import { iconNames } from '../components/ui/icons';
import { fontKeys } from './fonts';

/** A token such as `[PHONE_MAIN]`, meaning "owner still has to fill this in". */
export const PLACEHOLDER_PATTERN = /^\[[A-Z0-9_]+\]$/;
export const isPlaceholder = (value: string): boolean => PLACEHOLDER_PATTERN.test(value);

const placeholder = z.string().regex(PLACEHOLDER_PATTERN);

/** International phone number: "+" then 8–15 digits, no spaces. */
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone numbers must be international, e.g. +966500000000');

const emailSchema = z.email();
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Use a 6-digit hex colour, e.g. #C96E1F');
const nonEmpty = z.string().trim().min(1);

/** Filled value or explicit placeholder — never a half-typed value. */
const orPlaceholder = <T extends z.ZodType>(schema: T) => z.union([schema, placeholder]);

const localeSchema = z.enum(['ar', 'en']);
const localized = <T extends z.ZodType>(schema: T) => z.object({ ar: schema, en: schema });

const listItem = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slugs are lowercase-kebab-case'),
  icon: z.enum(iconNames),
  order: z.number().int(),
  enabled: z.boolean(),
});

const palette = z.object({
  paper: hexColor,
  surface: hexColor,
  ink: hexColor,
  muted: hexColor,
  line: hexColor,
  accent: hexColor,
  accentInk: hexColor,
  secondary: hexColor,
  alert: hexColor,
  alertInk: hexColor,
});

const urlOrEmpty = z.union([z.url({ protocol: /^https$/ }), z.literal('')]);

export const siteConfigSchema = z
  .object({
    name: nonEmpty,
    nameAr: nonEmpty,
    legalName: nonEmpty,
    domain: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/),
    url: z.url({ protocol: /^https$/ }),
    tagline: localized(nonEmpty),
    description: localized(nonEmpty.max(220)),
    phones: z.object({
      main: orPlaceholder(phoneSchema),
      emergency: orPlaceholder(phoneSchema),
    }),
    whatsapp: orPlaceholder(phoneSchema),
    emails: z.object({ info: emailSchema, support: emailSchema, sales: emailSchema }),
    formRecipients: z.object({
      cases: z.enum(['info', 'support', 'sales']),
      messages: z.enum(['info', 'support', 'sales']),
    }),
    address: localized(nonEmpty),
    mapUrl: orPlaceholder(z.url({ protocol: /^https$/ })),
    countryCode: orPlaceholder(z.string().regex(/^[A-Z]{2}$/)),
    hours: localized(nonEmpty),
    responseTime: localized(nonEmpty),
    social: z.object({
      linkedin: urlOrEmpty,
      x: urlOrEmpty,
      instagram: urlOrEmpty,
      facebook: urlOrEmpty,
      youtube: urlOrEmpty,
    }),
    languages: z.object({
      default: localeSchema,
      supported: z.array(localeSchema).min(1),
    }),
    defaultTheme: z.enum(['light', 'dark']),
    features: z.object({
      whatsappButton: z.boolean(),
      emergencyBanner: z.boolean(),
      analytics: z.object({
        enabled: z.boolean(),
        provider: z.enum(['cloudflare', 'plausible']),
        cloudflareToken: z.string(),
        plausibleDomain: z.string(),
      }),
      captcha: z.boolean(),
    }),
    stats: z.object({
      casesHandled: z.string(),
      yearsOfExperience: z.string(),
      successRate: z.string(),
    }),
    services: z.array(listItem).min(1),
    sectors: z.array(listItem).min(1),
    brand: z.object({
      light: palette,
      dark: palette,
      fonts: z.object({
        arHeading: z.enum(fontKeys),
        arBody: z.enum(fontKeys),
        enHeading: z.enum(fontKeys),
        enBody: z.enum(fontKeys),
        mono: z.enum(fontKeys),
      }),
    }),
    securityContact: emailSchema,
  })
  .superRefine((config, ctx) => {
    if (!config.languages.supported.includes(config.languages.default)) {
      ctx.addIssue({
        code: 'custom',
        path: ['languages', 'default'],
        message: 'The default language must be listed in `supported`.',
      });
    }
    for (const key of ['services', 'sectors'] as const) {
      const slugs = config[key].map((item) => item.slug);
      const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
      if (duplicate) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `Duplicate slug "${duplicate}".`,
        });
      }
    }
    const analytics = config.features.analytics;
    if (analytics.enabled && analytics.provider === 'cloudflare' && !analytics.cloudflareToken) {
      ctx.addIssue({
        code: 'custom',
        path: ['features', 'analytics', 'cloudflareToken'],
        message: 'Cloudflare analytics is enabled but no token is set.',
      });
    }
  });

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof siteConfigSchema>;

/** Formats zod issues into a list a non-developer can act on. */
export function formatConfigIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • site.config.ts → ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}
