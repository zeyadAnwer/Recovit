/** Primary navigation, shared by Header, MobileNav and Footer. */
import { routes, stripLocale, type Dictionary } from '../../i18n';

export interface NavItem {
  key: keyof Dictionary['nav'];
  href: string;
}

export const primaryNav: NavItem[] = [
  { key: 'services', href: routes.services },
  { key: 'sectors', href: routes.sectors },
  { key: 'process', href: routes.process },
  { key: 'about', href: routes.about },
  { key: 'faq', href: routes.faq },
  { key: 'contact', href: routes.contact },
];

/** True when `href` is the current page or one of its children. */
export function isCurrent(pathname: string, href: string): boolean {
  const current = stripLocale(pathname);
  return href === '/' ? current === '/' : current.startsWith(href);
}
