/**
 * Input schemas for the case request and contact forms. Field names are an
 * allow-list: anything not declared here is dropped by zod before the handler
 * ever sees it.
 */
import { z } from 'astro/zod';
import {
  CONTACT_METHODS,
  SYSTEM_TYPES,
  INCIDENT_TYPES,
  LIMITS,
  URGENCY_LEVELS,
  consentField,
  emailField,
  honeypotField,
  localeField,
  optionalLine,
  phoneField,
  requiredLine,
  requiredText,
} from './fields';

const choice = <T extends readonly [string, ...string[]]>(values: T) => z.enum(values, { error: 'choice' });

export const caseRequestSchema = z.object({
  locale: localeField,
  systemType: choice(SYSTEM_TYPES),
  systemDetails: optionalLine(LIMITS.systemDetails),
  incident: choice(INCIDENT_TYPES),
  details: requiredText(LIMITS.details),
  urgency: choice(URGENCY_LEVELS),
  name: requiredLine(LIMITS.name),
  phone: phoneField,
  email: emailField,
  contactMethod: choice(CONTACT_METHODS),
  organization: optionalLine(LIMITS.organization),
  consent: consentField,
  /** Honeypot — see fields.ts. Named to look tempting to bots. */
  website: honeypotField,
  'cf-turnstile-response': z.string().max(4096).nullish(),
});

export const contactMessageSchema = z.object({
  locale: localeField,
  name: requiredLine(LIMITS.name),
  email: emailField,
  phone: z
    .string()
    .nullish()
    .transform((value) => value ?? '')
    .pipe(z.union([z.literal(''), phoneField])),
  subject: requiredLine(LIMITS.subject),
  message: requiredText(LIMITS.message),
  consent: consentField,
  website: honeypotField,
  'cf-turnstile-response': z.string().max(4096).nullish(),
});

export type CaseRequest = z.output<typeof caseRequestSchema>;
export type ContactMessage = z.output<typeof contactMessageSchema>;
