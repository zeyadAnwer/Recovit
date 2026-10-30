/** In-place submission for the contact form (components/forms/ContactForm.astro). */
import { actions } from 'astro:actions';
import {
  applyServerErrors,
  clearErrors,
  message,
  setBusy,
  showReceipt,
  showSummary,
  validateScope,
} from './forms';

function init(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('form[data-form="message"]');
  if (!form) return;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  form.noValidate = true;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(form);
    const invalid = validateScope(form, form);
    if (invalid) {
      invalid.focus();
      return;
    }
    setBusy(submit, true);
    try {
      const { error } = await actions.sendMessage(new FormData(form));
      if (error) {
        const fields = applyServerErrors(form, error);
        if (fields.length > 0) showSummary(form, message(form, 'summary'), fields);
        return;
      }
      showReceipt(root, form);
    } catch {
      showSummary(form, message(form, 'generic'));
    } finally {
      setBusy(submit, false);
    }
  });
}

for (const root of document.querySelectorAll<HTMLElement>('[data-form-root="message"]')) init(root);
