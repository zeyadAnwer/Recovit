/**
 * Shared field rules and option lists for public forms.
 *
 * These are the single source of truth for form data shapes: the Astro
 * Actions, the HTML `maxlength`/`required` attributes, the client script and
 * any future client portal or API all read from here.
 */
import { z } from 'astro/zod';

export const LIMITS = {
  name: 100,
  email: 254,
  phone: 20,
  organization: 120,
  systemDetails: 200,
  details: 2000,
  message: 3000,
  subject: 150,
} as const;

export const SYSTEM_TYPES = [
  'files',
  'databases',
  'email',
  'cloud',
  'virtual',
  'endpoints',
  'other',
] as const;
export const INCIDENT_TYPES = ['ransomware', 'deleted', 'intrusion', 'corrupted', 'other'] as const;
export const URGENCY_LEVELS = ['standard', 'priority', 'emergency'] as const;
export const CONTACT_METHODS = ['phone', 'whatsapp', 'email'] as const;

export type SystemType = (typeof SYSTEM_TYPES)[number];
export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];
export type ContactMethod = (typeof CONTACT_METHODS)[number];

/**
 * Strips control characters (except newline/tab) so stored and emailed text
 * cannot carry terminal escapes or header-splitting characters.
 */
// eslint-disable-next-line no-control-regex -- intentionally matching control chars
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export const cleanText = (value: string): string => value.replace(CONTROL_CHARS, '').trim();
/** Single-line values additionally lose line breaks. */
export const cleanLine = (value: string): string => cleanText(value).replace(/[\r\n\t]+/g, ' ');

/** Required single-line text. Error codes map to dictionary messages. */
export const requiredLine = (max: number) =>
  z
    .string({ error: 'required' })
    .transform(cleanLine)
    .pipe(z.string().min(1, { error: 'required' }).max(max, { error: 'tooLong' }));

/** Optional text. Astro passes absent form fields as `null`, hence nullish. */
export const optionalLine = (max: number) =>
  z
    .string()
    .nullish()
    .transform((value) => (value ? cleanLine(value) : ''))
    .pipe(z.string().max(max, { error: 'tooLong' }));

export const requiredText = (max: number, min = 1) =>
  z
    .string({ error: 'required' })
    .transform(cleanText)
    .pipe(z.string().min(min, { error: 'required' }).max(max, { error: 'tooLong' }));

export const emailField = z
  .string({ error: 'required' })
  .transform(cleanLine)
  .pipe(
    z
      .string()
      .min(1, { error: 'required' })
      .max(LIMITS.email, { error: 'tooLong' })
      .pipe(z.email({ error: 'email' })),
  );

/**
 * HTML `pattern` for phone inputs (browsers compile it with the `v` flag, so
 * punctuation inside the class is escaped). Mirrors `phoneField` below.
 */
export const PHONE_PATTERN = String.raw`\+?[0-9\s\(\)\.\-]{7,20}`;

/** Accepts the common ways people type numbers; stores digits with optional "+". */
export const phoneField = z
  .string({ error: 'required' })
  .transform((value) => cleanLine(value).replace(/[\s().-]/g, ''))
  .pipe(
    z
      .string()
      .min(1, { error: 'required' })
      .regex(/^\+?\d{7,15}$/, { error: 'phone' }),
  );

/**
 * Honeypot: a visually hidden input real people leave empty. It is accepted
 * here and checked in the action, which then pretends to succeed so bots get
 * no signal (see lib/forms/security.ts).
 */
export const honeypotField = z.string().max(200).nullish();

/** Checkbox: browsers send "on" when ticked and nothing when not. */
export const consentField = z.union([z.literal('on'), z.literal('true'), z.literal(true)], {
  error: 'consent',
});

export const localeField = z.enum(['ar', 'en']).catch('ar');

/** Error codes the UI knows how to translate. */
export const FIELD_ERROR_CODES = ['required', 'tooLong', 'email', 'phone', 'choice', 'consent'] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

export function toErrorCode(message: string | undefined): FieldErrorCode {
  return (FIELD_ERROR_CODES as readonly string[]).includes(message ?? '')
    ? (message as FieldErrorCode)
    : 'required';
}
