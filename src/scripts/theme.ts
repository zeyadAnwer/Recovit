/**
 * Theme toggle. The initial theme is set by an inline script in the document
 * head (before paint); this module only wires up the button.
 */
export const THEME_STORAGE_KEY = 'recovik-theme';
export type Theme = 'light' | 'dark';

export function nextTheme(current: string | null | undefined): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

function store(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode, policies); the toggle still works for this page.
  }
}

/** The button is labelled "Dark theme"; pressed means dark is on. */
function syncButton(button: HTMLButtonElement, theme: Theme): void {
  button.setAttribute('aria-pressed', String(theme === 'dark'));
}

export function initThemeToggle(): void {
  const root = document.documentElement;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.hidden = false;
    syncButton(button, root.dataset['theme'] === 'dark' ? 'dark' : 'light');
    button.addEventListener('click', () => {
      const theme = nextTheme(root.dataset['theme']);
      root.dataset['theme'] = theme;
      store(theme);
      // The header and the mobile menu each have a toggle; keep both in sync.
      for (const other of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
        syncButton(other, theme);
      }
    });
  }
}
