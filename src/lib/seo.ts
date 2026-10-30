/**
 * SEO helpers: page titles and schema.org JSON-LD. Pure functions with no
 * Astro imports so they can be unit-tested.
 */
import { filled, site } from '../config';
import { pick, type Locale } from '../i18n';

/** Brand as written in titles: both scripts on Arabic pages, Latin elsewhere. */
export function brandName(locale: Locale): string {
  return locale === 'ar' ? `${site.nameAr} ${site.name}` : site.name;
}

export function pageTitle(title: string | undefined, suffix: string, locale: Locale = 'en'): string {
  return title ? `${title} · ${brandName(locale)}` : suffix;
}

type JsonLd = Record<string, unknown>;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string, base: URL | string): string {
  return new URL(path, base).toString();
}

/**
 * Organization data, upgraded to LocalBusiness when a real address exists.
 * Only filled settings values are included — never placeholders.
 */
export function organizationJsonLd(locale: Locale, siteUrl: string): JsonLd {
  const address = filled(pick(site.address, locale));
  const country = filled(site.countryCode);
  const telephone = filled(site.phones.main);
  const emergency = filled(site.phones.emergency);
  const sameAs = Object.values(site.social).filter((url) => filled(url));

  const contactPoint = [
    telephone && { '@type': 'ContactPoint', telephone, contactType: 'customer service' },
    emergency && {
      '@type': 'ContactPoint',
      telephone: emergency,
      contactType: 'emergency',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    },
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': address ? 'LocalBusiness' : 'Organization',
    '@id': `${siteUrl}#organization`,
    // Arabic pages lead with the Arabic name; the other script is the alternate.
    name: locale === 'ar' ? site.nameAr : site.name,
    alternateName: locale === 'ar' ? site.name : site.nameAr,
    ...(filled(site.legalName) ? { legalName: site.legalName } : {}),
    url: siteUrl,
    logo: absoluteUrl('/brand/recovik-mark.svg', siteUrl),
    image: absoluteUrl(`/og/${locale}.png`, siteUrl),
    description: pick(site.description, locale),
    email: site.emails.info,
    ...(telephone ? { telephone } : {}),
    ...(contactPoint.length ? { contactPoint } : {}),
    ...(address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            ...(country ? { addressCountry: country } : {}),
          },
        }
      : {}),
    ...(filled(site.mapUrl) ? { hasMap: site.mapUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  siteUrl: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: 'Data recovery',
    provider: { '@id': `${input.siteUrl}#organization` },
    ...(filled(site.countryCode) ? { areaServed: site.countryCode } : {}),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Serialises JSON-LD for a <script> element. Escapes "<" so content can never
 * close the script tag, whatever ends up in the content files.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
