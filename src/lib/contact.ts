/**
 * Pure helpers that turn settings values into links. Every function returns
 * `undefined` for placeholders/empty values so callers can simply hide UI.
 */
import { filled } from '../config';

export function telHref(phone: string): string | undefined {
  const value = filled(phone);
  return value ? `tel:${value}` : undefined;
}

export function mailHref(email: string): string | undefined {
  const value = filled(email);
  return value ? `mailto:${value}` : undefined;
}

/** wa.me expects digits only, without "+" or leading zeros. */
export function whatsappHref(phone: string): string | undefined {
  const value = filled(phone);
  return value ? `https://wa.me/${value.replace(/\D/g, '')}` : undefined;
}

/**
 * Displays an E.164 number in readable groups: "+966500000000" →
 * "+966 50 000 0000". Grouping is cosmetic; links always use the raw value.
 */
export function formatPhone(phone: string): string {
  const match = /^\+(\d{1,3})(\d{2})(\d{3})(\d+)$/.exec(phone);
  return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone;
}

export const SOCIAL_NETWORKS = ['linkedin', 'x', 'instagram', 'facebook', 'youtube'] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

/** Only the networks with a URL filled in, in a stable order. */
export function socialLinks(
  social: Record<SocialNetwork, string>,
): { network: SocialNetwork; url: string; label: string }[] {
  return SOCIAL_NETWORKS.flatMap((network) => {
    const url = filled(social[network]);
    return url ? [{ network, url, label: SOCIAL_LABELS[network] }] : [];
  });
}
