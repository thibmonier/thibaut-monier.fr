export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

// Choix mémorisé s'il est valide, sinon préférence système. Reflété en JavaScript brut dans public/theme-init.js.
export function resolveTheme(stored: string | null | undefined, systemDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return systemDark ? 'dark' : 'light';
}

export const toggleTheme = (current: Theme): Theme => (current === 'dark' ? 'light' : 'dark');
