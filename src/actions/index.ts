/**
 * Astro Actions — the site's only dynamic surface.
 *
 * Every submission goes through `guard()` (origin, honeypot, rate limit,
 * optional Turnstile) before zod-validated input reaches the email provider.
 * Errors returned to the browser are generic codes; details are never echoed.
 * Logs never contain personal data.
 */
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_SECONDS,
  TRUST_PROXY,
  TURNSTILE_SECRET_KEY,
} from 'astro:env/server';
import { site } from '../config';
import { generateCaseRef } from '../lib/case-ref';
import { getEmailProvider } from '../lib/email';
import { caseRequestEmail, contactMessageEmail } from '../lib/email/templates';
import { clientIp, isAllowedOrigin, isHoneypotTripped, verifyTurnstile } from '../lib/forms/security';
import { createRateLimiter } from '../lib/rate-limit';
import { caseRequestSchema, contactMessageSchema } from '../lib/validation/forms';

if (site.features.captcha && !TURNSTILE_SECRET_KEY) {
  throw new Error('features.captcha is on but TURNSTILE_SECRET_KEY is not set.');
}

const limiter = createRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_SECONDS * 1000,
});

type FormKind = 'case' | 'message';

/** Throws an ActionError when the request must not be processed. */
async function guard(
  kind: FormKind,
  context: ActionAPIContext,
  turnstileToken: string | null | undefined,
): Promise<void> {
  const origins = [context.url.origin, site.url, `https://www.${site.domain}`];
  if (!isAllowedOrigin(context.request.headers.get('origin'), origins)) {
    throw new ActionError({ code: 'FORBIDDEN', message: 'forbidden' });
  }

  const ip = clientIp(context.request.headers, context.clientAddress, TRUST_PROXY);
  const limit = limiter.hit(`${kind}:${ip}`);
  if (!limit.allowed) {
    throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'rateLimited' });
  }

  if (site.features.captcha) {
    const ok = await verifyTurnstile(turnstileToken, TURNSTILE_SECRET_KEY ?? '', ip);
    if (!ok) throw new ActionError({ code: 'BAD_REQUEST', message: 'captcha' });
  }
}

async function deliver(kind: FormKind, send: () => Promise<void>): Promise<void> {
  try {
    await send();
  } catch (error) {
    // Only the error type/code is logged: never the message body or addresses.
    const code = error instanceof Error ? error.name : 'unknown';
    console.error(`[forms] ${kind} delivery failed (${code})`);
    throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'generic' });
  }
}

export const server = {
  submitCase: defineAction({
    accept: 'form',
    input: caseRequestSchema,
    handler: async (input, context) => {
      await guard('case', context, input['cf-turnstile-response']);
      const ref = generateCaseRef();
      // Bots get a believable answer and nothing is sent.
      if (isHoneypotTripped(input.website)) return { ref };
      const email = caseRequestEmail(input, ref);
      await deliver('case', () =>
        getEmailProvider().send({
          to: site.emails[site.formRecipients.cases],
          replyTo: input.email,
          ...email,
        }),
      );
      return { ref };
    },
  }),

  sendMessage: defineAction({
    accept: 'form',
    input: contactMessageSchema,
    handler: async (input, context) => {
      await guard('message', context, input['cf-turnstile-response']);
      if (isHoneypotTripped(input.website)) return { ok: true };
      const email = contactMessageEmail(input);
      await deliver('message', () =>
        getEmailProvider().send({
          to: site.emails[site.formRecipients.messages],
          replyTo: input.email,
          ...email,
        }),
      );
      return { ok: true };
    },
  }),
};
