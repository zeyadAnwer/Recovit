/** Every public page path (default language form). Shared by e2e specs. */
export const PAGES = [
  '/',
  '/services/',
  '/services/digital-forensics/',
  '/services/ransomware-recovery/',
  '/sectors/',
  '/process/',
  '/about/',
  '/faq/',
  '/start-a-case/',
  '/contact/',
  '/privacy/',
  '/terms/',
];

export const localized = (path: string, lang: 'ar' | 'en') => (lang === 'ar' ? path : `/en${path}`);
