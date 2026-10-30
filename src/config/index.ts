/**
 * Validated settings. Import `site` from here — never import the raw
 * `site.config.ts` in components — so every consumer sees checked data.
 */
import { formatConfigIssues, isPlaceholder, siteConfigSchema, type SiteConfig } from './schema';
import { siteConfig } from './site.config';

const result = siteConfigSchema.safeParse(siteConfig);
if (!result.success) {
  throw new Error(`Invalid site settings:\n${formatConfigIssues(result.error)}`);
}

export const site: SiteConfig = result.data;
export type { SiteConfig };
export type ListItem = SiteConfig['services'][number];

/**
 * Returns the value only when it is real (not empty, not a `[PLACEHOLDER]`).
 * Components use this to hide blocks the owner has not filled in yet.
 */
export function filled(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed && !isPlaceholder(trimmed) ? trimmed : undefined;
}

/** Enabled list items sorted by `order`. */
export function enabledItems<T extends { enabled: boolean; order: number }>(items: readonly T[]): T[] {
  return items.filter((item) => item.enabled).sort((a, b) => a.order - b.order);
}
