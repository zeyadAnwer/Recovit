/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Recovik — site settings · إعدادات الموقع
 * ─────────────────────────────────────────────────────────────────────────────
 *  EN: This is the ONLY place for business data: names, phones, emails,
 *      address, hours, numbers, feature switches, services/sectors lists and
 *      brand tokens. Nothing in this file may be hard-coded anywhere else.
 *      The file is validated by `schema.ts` at build time — a typo fails the
 *      build with a readable message instead of shipping a broken page.
 *
 *  AR: هذا هو المكان الوحيد لبيانات الشركة: الاسم والهواتف والبريد والعنوان
 *      وساعات العمل والأرقام ومفاتيح الميزات وقوائم الخدمات والقطاعات وألوان
 *      الهوية. لا تُكتب هذه البيانات في أي ملف آخر. يتم التحقق من هذا الملف عند
 *      البناء، فإن وُجد خطأ يتوقف البناء برسالة واضحة.
 *
 *  Placeholders · القيم المؤقتة
 *      EN: A value written like `[PHONE_MAIN]` is a placeholder. The site hides
 *          anything that is still a placeholder or empty, and
 *          `pnpm launch:check` lists every placeholder left to fill.
 *      AR: القيمة المكتوبة بالشكل `[PHONE_MAIN]` قيمة مؤقتة. يُخفي الموقع كل
 *          قيمة مؤقتة أو فارغة، والأمر `pnpm launch:check` يعرض ما تبقّى منها.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { SiteConfigInput } from './schema';

export const siteConfig = {
  // ── Identity · الهوية ──────────────────────────────────────────────────────
  /**
   * EN: Latin brand name. English pages use it alone; Arabic pages pair it with
   *     `nameAr` in the bilingual lockup, <title>, OG image and JSON-LD.
   * AR: الاسم اللاتيني للعلامة. في الصفحات العربية يظهر مع الاسم العربي معًا.
   */
  name: 'Recovik',
  /** EN: Arabic brand name. AR: الاسم العربي للعلامة. */
  nameAr: 'ريكوفِك',
  /** EN: Registered legal name (invoices, terms). AR: الاسم القانوني المسجّل. */
  legalName: '[LEGAL_NAME]',
  /** EN: Primary domain (no protocol). AR: النطاق الأساسي بدون https. */
  domain: 'recovik.com',
  /**
   * EN: Canonical site URL used for SEO links and the sitemap. Can be overridden
   *     at build time with the SITE_URL environment variable (e.g. staging).
   * AR: رابط الموقع المعتمد لمحركات البحث. يمكن تغييره عند البناء عبر SITE_URL.
   */
  url: 'https://recovik.com',
  tagline: {
    ar: 'خبراء استعادة البيانات',
    en: 'Data Recovery Experts',
  },
  description: {
    ar: 'استعادة البيانات بعد هجمات الفدية والحذف والاختراق: فك التشفير، والتحقيق الرقمي، واستعادة قواعد البيانات والملفات والبيانات السحابية، ثم سدّ الثغرة.',
    en: 'Data recovery after ransomware, deletion and breaches: decryption, digital forensics, database, file and cloud recovery — then we close the gap that let it happen.',
  },

  // ── Contact · التواصل ──────────────────────────────────────────────────────
  /**
   * EN: Phone numbers in international format, e.g. "+966500000000".
   * AR: أرقام الهاتف بالصيغة الدولية، مثل "+966500000000".
   */
  phones: {
    main: '[PHONE_MAIN]',
    /** EN: Answered 24/7. AR: يُجاب عليه على مدار الساعة. */
    emergency: '[PHONE_EMERGENCY]',
  },
  /** EN: WhatsApp number, international format. AR: رقم واتساب بالصيغة الدولية. */
  whatsapp: '[WHATSAPP_NUMBER]',
  emails: {
    info: 'info@recovik.com',
    support: 'support@recovik.com',
    sales: 'sales@recovik.com',
  },
  /**
   * EN: Where form submissions are delivered. Case requests go to `cases`,
   *     contact messages go to `messages`. Must be keys of `emails`.
   * AR: وجهة رسائل النماذج: طلبات الحالات إلى cases ورسائل التواصل إلى messages.
   */
  formRecipients: {
    cases: 'support',
    messages: 'info',
  },
  address: {
    ar: '[ADDRESS_AR]',
    en: '[ADDRESS_EN]',
  },
  /** EN: Full Google Maps URL. AR: رابط خرائط Google كاملًا. */
  mapUrl: '[GOOGLE_MAPS_URL]',
  /** EN: ISO country code for structured data, e.g. "SA". AR: رمز الدولة، مثل SA. */
  countryCode: '[COUNTRY_CODE]',
  hours: {
    ar: '[WORKING_HOURS_AR]',
    en: '[WORKING_HOURS_EN]',
  },

  /**
   * EN: Response-time promise shown in the hero trust row, e.g. "Response within
   *     1 hour". Hidden until filled. Only put a promise you can keep.
   * AR: وعد زمن الاستجابة في شريط الثقة، مثل «نرد خلال ساعة». يُخفى حتى يُملأ.
   */
  responseTime: {
    ar: '[RESPONSE_TIME_AR]',
    en: '[RESPONSE_TIME_EN]',
  },

  // ── Social · حسابات التواصل الاجتماعي ─────────────────────────────────────
  /** EN: Leave empty to hide. AR: اتركه فارغًا لإخفائه. */
  social: {
    linkedin: '',
    x: '',
    instagram: '',
    facebook: '',
    youtube: '',
  },

  // ── Languages & theme · اللغات والمظهر ────────────────────────────────────
  languages: {
    /** EN: Served at "/". AR: اللغة التي تظهر على الرابط الرئيسي "/". */
    default: 'ar',
    supported: ['ar', 'en'],
  },
  /** EN: "light" or "dark". AR: المظهر الافتراضي: light أو dark. */
  defaultTheme: 'light',

  // ── Feature switches · مفاتيح الميزات ─────────────────────────────────────
  features: {
    /** EN: Floating WhatsApp button (needs `whatsapp`). AR: زر واتساب العائم. */
    whatsappButton: true,
    /** EN: Thin 24/7 emergency strip above the header. AR: شريط الطوارئ أعلى الصفحة. */
    emergencyBanner: true,
    /**
     * EN: Privacy-friendly analytics. Off by default. When on, set `provider`
     *     and `token`/`domain` below; the CSP is opened for that origin only.
     * AR: إحصاءات تحترم الخصوصية. معطّلة افتراضيًا.
     */
    analytics: {
      enabled: false,
      /** "cloudflare" | "plausible" */
      provider: 'plausible',
      /** EN: Cloudflare beacon token. AR: رمز Cloudflare. */
      cloudflareToken: '',
      /** EN: Domain registered in Plausible. AR: النطاق المسجّل في Plausible. */
      plausibleDomain: 'recovik.com',
    },
    /**
     * EN: Cloudflare Turnstile on forms. Needs PUBLIC_TURNSTILE_SITE_KEY and
     *     TURNSTILE_SECRET_KEY in the environment, otherwise the build stops.
     * AR: حماية Turnstile للنماذج. تتطلب مفاتيح Turnstile في متغيرات البيئة.
     */
    captcha: false,
  },

  // ── Numbers · الأرقام ─────────────────────────────────────────────────────
  /**
   * EN: Real, verifiable figures only. A placeholder or empty value hides the
   *     figure; if all are hidden, the whole block disappears.
   * AR: أرقام حقيقية يمكن إثباتها فقط. القيمة المؤقتة أو الفارغة تُخفي الرقم.
   */
  stats: {
    casesHandled: '[CASES_HANDLED]',
    yearsOfExperience: '[YEARS_OF_EXPERIENCE]',
    /** EN: Share of ransomware cases fully or largely restored — only a real figure. */
    successRate: '[SUCCESS_RATE]',
  },

  // ── Services & sectors · الخدمات والقطاعات ────────────────────────────────
  /**
   * EN: One line per service. Its text lives in
   *     src/content/services/{ar,en}/<slug>.md — the build fails if missing.
   *     `icon` must be a name from src/components/ui/icons.ts.
   * AR: سطر لكل خدمة، ونصّها في src/content/services/{ar,en}/<slug>.md.
   */
  services: [
    { slug: 'ransomware-recovery', icon: 'fileLock', order: 1, enabled: true },
    { slug: 'deleted-data-recovery', icon: 'fileRestore', order: 2, enabled: true },
    { slug: 'digital-forensics', icon: 'timeline', order: 3, enabled: true },
    { slug: 'database-and-file-recovery', icon: 'database', order: 4, enabled: true },
    { slug: 'cloud-and-saas-recovery', icon: 'cloud', order: 5, enabled: true },
    { slug: 'post-incident-hardening', icon: 'layers', order: 6, enabled: true },
  ],
  /** EN: Same rule, content in src/content/sectors/. AR: النص في src/content/sectors/. */
  sectors: [
    { slug: 'individuals', icon: 'person', order: 1, enabled: true },
    { slug: 'small-business', icon: 'shop', order: 2, enabled: true },
    { slug: 'companies', icon: 'building', order: 3, enabled: true },
    { slug: 'government', icon: 'seal', order: 4, enabled: true },
    { slug: 'healthcare', icon: 'health', order: 5, enabled: true },
    { slug: 'finance', icon: 'ledger', order: 6, enabled: true },
    { slug: 'legal', icon: 'scale', order: 7, enabled: true },
    { slug: 'education', icon: 'book', order: 8, enabled: true },
  ],

  // ── Brand tokens · ألوان وخطوط الهوية ─────────────────────────────────────
  /**
   * EN: Colours as hex. Keep WCAG AA contrast: `pnpm test` checks text colours
   *     against their backgrounds and fails below 4.5:1.
   * AR: الألوان بصيغة hex. يفحص `pnpm test` تباين النص ويفشل إن قلّ عن 4.5:1.
   */
  brand: {
    /**
     * EN: Roles — accent: "data restored" (primary actions, progress);
     *     secondary: links and focus; alert: incidents and the emergency action.
     * AR: الأدوار — accent للإجراء الأساسي، secondary للروابط، alert للطوارئ.
     */
    light: {
      paper: '#F4F6F5',
      surface: '#FFFFFF',
      ink: '#0C1B26',
      muted: '#4A5865',
      line: '#DCE2E5',
      accent: '#0A7258',
      accentInk: '#FFFFFF',
      secondary: '#1F57A0',
      alert: '#B4361C',
      alertInk: '#FFFFFF',
    },
    dark: {
      paper: '#08121A',
      surface: '#0F1C26',
      ink: '#E6EDF1',
      muted: '#9AA9B5',
      line: '#1F2F3B',
      accent: '#3CC9A0',
      accentInk: '#03150F',
      secondary: '#8AB8F0',
      alert: '#FF8C6B',
      alertInk: '#1A0700',
    },
    /**
     * EN: Font keys from src/config/fonts.ts (installed Fontsource packages).
     * AR: مفاتيح الخطوط من src/config/fonts.ts.
     */
    fonts: {
      arHeading: 'alexandria',
      arBody: 'ibm-plex-sans-arabic',
      enHeading: 'bricolage-grotesque',
      enBody: 'public-sans',
      mono: 'system-mono',
    },
  },

  // ── Security contact · جهة الإبلاغ الأمني ─────────────────────────────────
  /** EN: Published in /.well-known/security.txt. AR: يُنشر في security.txt. */
  securityContact: 'security@recovik.com',
} as const satisfies SiteConfigInput;
