/**
 * Picks the email provider from validated environment variables (astro:env).
 * Created lazily and cached for the life of the process.
 */
import {
  EMAIL_PROVIDER,
  MAIL_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from 'astro:env/server';
import { SmtpProvider } from './smtp';
import { TestProvider } from './test-provider';
import type { EmailProvider } from './types';

let provider: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (provider) return provider;
  if (EMAIL_PROVIDER === 'test') {
    console.warn('[email] EMAIL_PROVIDER=test — messages are kept in memory and NOT delivered.');
    provider = new TestProvider();
  } else {
    provider = new SmtpProvider({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      user: SMTP_USER,
      pass: SMTP_PASS,
      from: MAIL_FROM,
    });
  }
  return provider;
}

export type { EmailMessage, EmailProvider } from './types';
export { EmailConfigError } from './types';
