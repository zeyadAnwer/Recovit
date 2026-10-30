import { describe, expect, it } from 'vitest';
import { LIMITS, cleanLine, cleanText, toErrorCode } from '../../src/lib/validation/fields';
import { caseRequestSchema, contactMessageSchema } from '../../src/lib/validation/forms';

const validCase = {
  locale: 'en',
  systemType: 'databases',
  systemDetails: 'SQL Server 2019',
  incident: 'ransomware',
  details: 'Files renamed to .locked, ransom note on the server.',
  urgency: 'priority',
  name: 'Sara Ahmed',
  phone: '+966 50 123 4567',
  email: 'sara@example.com',
  contactMethod: 'whatsapp',
  organization: '',
  consent: 'on',
  website: '',
};

function codes(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]),
  );
}

describe('caseRequestSchema', () => {
  it('accepts a complete request and normalises the phone number', () => {
    const result = caseRequestSchema.safeParse(validCase);
    expect(result.success).toBe(true);
    expect(result.data?.phone).toBe('+966501234567');
  });

  it('reports missing choices and consent with UI error codes', () => {
    const omitted = new Set(['systemType', 'urgency', 'consent']);
    const rest = Object.fromEntries(Object.entries(validCase).filter(([key]) => !omitted.has(key)));
    const result = caseRequestSchema.safeParse(rest);
    expect(result.success).toBe(false);
    expect(codes(result)).toMatchObject({ systemType: 'choice', urgency: 'choice', consent: 'consent' });
  });

  it('rejects unknown option values', () => {
    const result = caseRequestSchema.safeParse({ ...validCase, systemType: 'floppy' });
    expect(codes(result)['systemType']).toBe('choice');
  });

  it('rejects invalid email and phone', () => {
    const result = caseRequestSchema.safeParse({ ...validCase, email: 'not-an-email', phone: '12' });
    expect(codes(result)).toMatchObject({ email: 'email', phone: 'phone' });
  });

  it('enforces length limits', () => {
    const result = caseRequestSchema.safeParse({ ...validCase, details: 'x'.repeat(LIMITS.details + 1) });
    expect(codes(result)['details']).toBe('tooLong');
  });

  it('treats whitespace-only text as missing', () => {
    const result = caseRequestSchema.safeParse({ ...validCase, name: '   ' });
    expect(codes(result)['name']).toBe('required');
  });

  it('drops fields that are not on the allow-list', () => {
    const result = caseRequestSchema.safeParse({ ...validCase, isAdmin: true, __proto__x: 1 });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty('isAdmin');
  });

  it('falls back to the default locale for unknown values', () => {
    expect(caseRequestSchema.parse({ ...validCase, locale: 'xx' }).locale).toBe('ar');
  });
});

describe('contactMessageSchema', () => {
  it('accepts a message with an empty optional phone', () => {
    const result = contactMessageSchema.safeParse({
      name: 'Omar',
      email: 'omar@example.com',
      phone: '',
      subject: 'Quote',
      message: 'Hello',
      consent: 'on',
    });
    expect(result.success).toBe(true);
  });
});

describe('text cleaning', () => {
  it('removes control characters but keeps line breaks in long text', () => {
    expect(cleanText('a\u0000b\u001bc\nd')).toBe('abc\nd');
  });

  it('flattens single-line values so headers cannot be split', () => {
    expect(cleanLine('Subject\r\nBcc: x@example.com')).toBe('Subject Bcc: x@example.com');
  });

  it('maps unknown error messages to "required"', () => {
    expect(toErrorCode('email')).toBe('email');
    expect(toErrorCode('Invalid input')).toBe('required');
    expect(toErrorCode(undefined)).toBe('required');
  });
});

describe('Astro form data quirks', () => {
  it('accepts null for absent optional fields (how Astro passes them)', () => {
    const result = caseRequestSchema.safeParse({
      ...validCase,
      systemDetails: null,
      organization: null,
      website: null,
      'cf-turnstile-response': null,
    });
    expect(result.success).toBe(true);
    expect(result.data?.systemDetails).toBe('');
  });
});
