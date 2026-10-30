/**
 * Multi-step behaviour for the case form (components/forms/CaseForm.astro).
 * Shows one step at a time, validates before moving on, builds the review
 * list, and submits through the `submitCase` action without leaving the page.
 */
import { actions } from 'astro:actions';
import {
  applyServerErrors,
  clearErrors,
  hideSummary,
  message,
  setBusy,
  showReceipt,
  showSummary,
  validateScope,
} from './forms';

/** What the visitor chose or typed, as shown in the review list. */
function displayValue(
  step: HTMLElement,
  control: HTMLInputElement | HTMLTextAreaElement,
  name: string,
): string {
  if (control instanceof HTMLInputElement && control.type === 'radio') {
    const checked = step.querySelector<HTMLInputElement>(`input[name="${CSS.escape(name)}"]:checked`);
    return checked?.closest('label')?.querySelector('.choice__label')?.textContent?.trim() ?? '';
  }
  return control.value.trim();
}

function init(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('form[data-form="case"]');
  if (!form) return;
  const steps = [...form.querySelectorAll<HTMLElement>('[data-step]')];
  const progress = [...form.querySelectorAll<HTMLElement>('[data-progress-item]')];
  const back = form.querySelector<HTMLButtonElement>('[data-step-back]');
  const next = form.querySelector<HTMLButtonElement>('[data-step-next]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const review = form.querySelector<HTMLElement>('[data-review]');
  let current = 0;

  form.noValidate = true;
  form.classList.add('js-steps');
  form.querySelector<HTMLElement>('[data-noscript-note]')?.setAttribute('hidden', '');
  form.querySelector<HTMLElement>('[data-review-lead]')?.removeAttribute('hidden');

  const show = (index: number, moveFocus: boolean) => {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => {
      step.hidden = i !== current;
    });
    progress.forEach((item, i) => {
      if (i === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.dataset['state'] = i < current ? 'done' : 'todo';
    });
    if (back) back.hidden = current === 0;
    if (next) next.hidden = current === steps.length - 1;
    if (submit) submit.hidden = current !== steps.length - 1;
    if (current === steps.length - 1) buildReview();
    if (moveFocus) {
      steps[current]?.querySelector<HTMLElement>('.case-step__title')?.focus();
      form.scrollIntoView({ block: 'start' });
    }
  };

  const stepOf = (fieldName: string): number =>
    steps.findIndex((step) => step.querySelector(`[data-field="${CSS.escape(fieldName)}"]`));

  /** Review list built with DOM APIs only: user text is never parsed as HTML. */
  const buildReview = () => {
    if (!review) return;
    const empty = review.dataset['empty'] ?? '—';
    const rows: HTMLElement[] = [];
    steps.slice(0, -1).forEach((step, stepIndex) => {
      const seen = new Set<string>();
      for (const control of step.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]')) {
        const name = control.dataset['field'] ?? '';
        if (seen.has(name) || name === 'consent') continue;
        seen.add(name);
        const wrapper = step.querySelector(`[data-field-wrapper="${CSS.escape(name)}"]`);
        const label = wrapper?.querySelector('legend, label')?.firstChild?.textContent?.trim() ?? name;
        const value = displayValue(step, control, name);
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        const edit = document.createElement('button');
        dt.textContent = label;
        dd.textContent = value || empty;
        edit.type = 'button';
        edit.textContent = back?.dataset['editLabel'] ?? '';
        edit.addEventListener('click', () => show(stepIndex, true));
        row.append(dt, dd, edit);
        rows.push(row);
      }
    });
    review.replaceChildren(...rows);
    review.hidden = false;
  };

  next?.addEventListener('click', () => {
    const step = steps[current];
    if (!step) return;
    const invalid = validateScope(form, step);
    if (invalid) {
      invalid.focus();
      return;
    }
    hideSummary(form);
    show(current + 1, true);
  });

  back?.addEventListener('click', () => show(current - 1, true));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(form);
    // Re-check every step: the visitor may have edited earlier answers.
    for (const [index, step] of steps.entries()) {
      const invalid = validateScope(form, step);
      if (invalid) {
        show(index, false);
        invalid.focus();
        return;
      }
    }
    setBusy(submit, true);
    try {
      const { data, error } = await actions.submitCase(new FormData(form));
      if (error) {
        const fields = applyServerErrors(form, error);
        const first = fields[0];
        if (first !== undefined) {
          show(Math.max(0, stepOf(first)), false);
          showSummary(form, message(form, 'summary'), fields);
        }
        return;
      }
      const ref = root.querySelector<HTMLElement>('[data-case-ref]');
      if (ref) ref.textContent = data.ref;
      showReceipt(root, form);
    } catch {
      showSummary(form, message(form, 'generic'));
    } finally {
      setBusy(submit, false);
    }
  });

  show(0, false);
}

for (const root of document.querySelectorAll<HTMLElement>('[data-form-root="case"]')) init(root);
