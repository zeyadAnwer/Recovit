/**
 * Plain-text emails sent to the Recovik team. Labels are bilingual because
 * the inbox is shared; user input is inserted as text, never as markup.
 */
import type { CaseRequest, ContactMessage } from '../validation/forms';

const line = (label: string, value: string) => `${label}: ${value || '—'}`;

export function caseRequestEmail(input: CaseRequest, ref: string): { subject: string; text: string } {
  const urgent = input.urgency === 'emergency' ? ' [EMERGENCY]' : '';
  return {
    subject: `[${ref}]${urgent} New incident — ${input.incident} / ${input.systemType}`,
    text: [
      `New incident report · بلاغ حادثة جديد`,
      `Reference · رقم الحالة: ${ref}`,
      '',
      '— Systems · الأنظمة',
      line('Affected · المتأثر', input.systemType),
      line('Details · التفاصيل', input.systemDetails),
      line('Incident · ما حدث', input.incident),
      line('Urgency · الاستعجال', input.urgency),
      '',
      '— Description · الوصف',
      input.details,
      '',
      '— Contact · التواصل',
      line('Name · الاسم', input.name),
      line('Phone · الهاتف', input.phone),
      line('Email · البريد', input.email),
      line('Preferred · الوسيلة المفضلة', input.contactMethod),
      line('Organisation · الجهة', input.organization),
      line('Site language · لغة الموقع', input.locale),
    ].join('\n'),
  };
}

export function contactMessageEmail(input: ContactMessage): { subject: string; text: string } {
  return {
    subject: `Website message — ${input.subject}`,
    text: [
      `Website message · رسالة من الموقع`,
      '',
      line('Name · الاسم', input.name),
      line('Email · البريد', input.email),
      line('Phone · الهاتف', input.phone),
      line('Subject · الموضوع', input.subject),
      line('Site language · لغة الموقع', input.locale),
      '',
      input.message,
    ].join('\n'),
  };
}
