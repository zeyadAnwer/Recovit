import type { EmailMessage, EmailProvider } from './types';

/**
 * Keeps messages in memory and sends nothing. Selected with
 * EMAIL_PROVIDER=test for local development and end-to-end tests.
 * Never use it in production: submissions would be silently dropped.
 */
export class TestProvider implements EmailProvider {
  readonly name = 'test';
  readonly outbox: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.outbox.push(message);
    if (this.outbox.length > 50) this.outbox.shift();
  }
}
