/**
 * The only contract the forms know about. To switch providers (Resend,
 * Postmark, SES…), add a class implementing `EmailProvider` and select it in
 * `index.ts`; no form or action code changes.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  /** Plain text only: we never render user input as HTML. */
  text: string;
  replyTo?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

/** Thrown when the provider is selected but not configured. Message is safe to log. */
export class EmailConfigError extends Error {
  override name = 'EmailConfigError';
}
