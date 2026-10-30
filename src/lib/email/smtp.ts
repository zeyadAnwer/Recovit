import nodemailer, { type Transporter } from 'nodemailer';
import { EmailConfigError, type EmailMessage, type EmailProvider } from './types';

export interface SmtpOptions {
  host: string | undefined;
  port: number;
  secure: boolean;
  user: string | undefined;
  pass: string | undefined;
  from: string | undefined;
}

/** SMTP delivery via nodemailer. Works with any mailbox provider. */
export class SmtpProvider implements EmailProvider {
  readonly name = 'smtp';
  readonly #transporter: Transporter;
  readonly #from: string;

  constructor(options: SmtpOptions) {
    const missing = (['host', 'user', 'pass', 'from'] as const).filter((key) => !options[key]);
    if (missing.length > 0) {
      throw new EmailConfigError(
        `SMTP is selected but not configured. Missing: ${missing
          .map((key) => (key === 'from' ? 'MAIL_FROM' : `SMTP_${key.toUpperCase()}`))
          .join(', ')}`,
      );
    }
    this.#from = options.from as string;
    this.#transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: { user: options.user, pass: options.pass },
      // Refuse to send credentials or personal data over an unencrypted link.
      requireTLS: !options.secure,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      // Never log message contents.
      logger: false,
      debug: false,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.#transporter.sendMail({
      from: this.#from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      // Plain text only; nodemailer will not add an HTML part.
      disableUrlAccess: true,
      disableFileAccess: true,
    });
  }
}
