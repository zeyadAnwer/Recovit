/**
 * Shared form enhancement: client-side validation messages, error summary,
 * server error mapping and in-place submission through Astro Actions.
 * Everything here is progressive: without JS the forms still post normally.
 * User input is only ever written with `textContent`, never as HTML.
 */
import { isInputError, type ActionError } from 'astro:actions';

export type ErrorCode = 'required' | 'tooLong' | 'email' | 'phone' | 'choice' | 'consent';
type FieldControl = HTMLInputElement | HTMLTextAreaElement;

const MESSAGE_KEYS: Record<ErrorCode | 'generic' | 'rateLimited' | 'captcha' | 'summary', string> = {
  required: 'msgRequired',
  tooLong: 'msgTooLong',
  email: 'msgEmail',
  phone: 'msgPhone',
  choice: 'msgChoice',
  consent: 'msgConsent',
  generic: 'msgGeneric',
  rateLimited: 'msgRateLimited',
  captcha: 'msgCaptcha',
  summary: 'msgSummary',
};

export function message(form: HTMLFormElement, key: keyof typeof MESSAGE_KEYS): string {
  return form.dataset[MESSAGE_KEYS[key]] ?? form.dataset['msgGeneric'] ?? '';
}

/** Maps the browser's constraint validation state to our error codes. */
export function errorCodeFor(control: FieldControl): ErrorCode | undefined {
  const { validity } = control;
  if (validity.valid) return undefined;
  if (validity.valueMissing) {
    if (control instanceof HTMLInputElement && control.type === 'radio') return 'choice';
    if (control instanceof HTMLInputElement && control.type === 'checkbox') return 'consent';
    return 'required';
  }
  if (validity.tooLong) return 'tooLong';
  if (validity.typeMismatch && control.type === 'email') return 'email';
  if (validity.patternMismatch && control.type === 'tel') return 'phone';
  return 'required';
}

function controlsByName(scope: ParentNode): Map<string, FieldControl[]> {
  const groups = new Map<string, FieldControl[]>();
  for (const control of scope.querySelectorAll<FieldControl>('[data-field]')) {
    const name = control.dataset['field'] ?? control.name;
    groups.set(name, [...(groups.get(name) ?? []), control]);
  }
  return groups;
}

export function setFieldError(form: HTMLFormElement, name: string, text: string): void {
  const target = form.querySelector<HTMLElement>(`[data-error-for="${CSS.escape(name)}"]`);
  if (target) target.textContent = text;
  const wrapper = form.querySelector<HTMLElement>(`[data-field-wrapper="${CSS.escape(name)}"]`);
  const invalid = text ? 'true' : 'false';
  if (wrapper?.tagName === 'FIELDSET') wrapper.setAttribute('aria-invalid', invalid);
  for (const control of form.querySelectorAll<FieldControl>(`[data-field="${CSS.escape(name)}"]`)) {
    if (control.type !== 'radio') control.setAttribute('aria-invalid', invalid);
  }
}

export function clearErrors(form: HTMLFormElement, scope: ParentNode = form): void {
  for (const name of controlsByName(scope).keys()) setFieldError(form, name, '');
  hideSummary(form);
}

/**
 * Validates the controls inside `scope`, shows messages next to each, and
 * returns the first invalid control (to focus) or undefined when all valid.
 */
export function validateScope(form: HTMLFormElement, scope: ParentNode): FieldControl | undefined {
  let firstInvalid: FieldControl | undefined;
  for (const [name, controls] of controlsByName(scope)) {
    const failing = controls.find((control) => !control.validity.valid);
    const code = failing ? errorCodeFor(failing) : undefined;
    setFieldError(form, name, code ? message(form, code) : '');
    if (failing && !firstInvalid) firstInvalid = failing;
  }
  return firstInvalid;
}

function summaryElement(form: HTMLFormElement): HTMLElement | null {
  return form.querySelector<HTMLElement>('[data-error-summary]');
}

export function hideSummary(form: HTMLFormElement): void {
  const summary = summaryElement(form);
  if (summary) {
    summary.hidden = true;
    summary.replaceChildren();
  }
}

/** Shows a summary with a generic message, or a list of field links. */
export function showSummary(form: HTMLFormElement, text: string, fields: string[] = []): void {
  const summary = summaryElement(form);
  if (!summary) return;
  const heading = document.createElement('p');
  heading.textContent = text;
  summary.replaceChildren(heading);
  if (fields.length > 0) {
    const list = document.createElement('ul');
    for (const name of fields) {
      const control = form.querySelector<HTMLElement>(`[data-field="${CSS.escape(name)}"]`);
      const wrapper = form.querySelector<HTMLElement>(`[data-field-wrapper="${CSS.escape(name)}"]`);
      const label =
        wrapper?.querySelector('legend, label')?.textContent?.trim() ?? control?.getAttribute('name') ?? name;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = control?.id ? `#${control.id}` : '#';
      link.textContent = label;
      item.append(link);
      list.append(item);
    }
    summary.append(list);
  }
  summary.hidden = false;
  summary.focus();
}

/** Maps an Action error to field messages; returns the names of failing fields. */
export function applyServerErrors(form: HTMLFormElement, error: ActionError): string[] {
  if (isInputError(error)) {
    const names = Object.keys(error.fields);
    for (const name of names) {
      const code = (error.fields as Record<string, string[] | undefined>)[name]?.[0];
      const key = (code && code in MESSAGE_KEYS ? code : 'required') as ErrorCode;
      setFieldError(form, name, message(form, key));
    }
    return names;
  }
  const code = error.message === 'rateLimited' || error.message === 'captcha' ? error.message : 'generic';
  showSummary(form, message(form, code));
  return [];
}

export function setBusy(button: HTMLButtonElement | null, busy: boolean): void {
  if (!button) return;
  const label = button.querySelector('span');
  if (busy) {
    button.dataset['idleLabel'] = label?.textContent ?? '';
    if (label) label.textContent = button.dataset['sendingLabel'] ?? label.textContent;
  } else if (label && button.dataset['idleLabel'] !== undefined) {
    label.textContent = button.dataset['idleLabel'];
  }
  button.disabled = busy;
  button.setAttribute('aria-disabled', String(busy));
}

/** Swaps the form for its receipt panel and moves focus to the heading. */
export function showReceipt(root: HTMLElement, form: HTMLFormElement): void {
  const receipt = root.querySelector<HTMLElement>('[data-receipt]');
  if (!receipt) return;
  form.hidden = true;
  receipt.hidden = false;
  receipt.querySelector<HTMLElement>('[data-receipt-title]')?.focus();
  root.scrollIntoView({ block: 'start' });
}
