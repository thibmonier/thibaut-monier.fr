import { en } from './en.ts';
import { fr, type Dictionary } from './fr.ts';

export type Locale = 'fr' | 'en';
export const defaultLocale: Locale = 'fr';

const dictionaries: Record<Locale, Dictionary> = { fr, en };

// Le français est sans préfixe, l'anglais sous /en/ (ADR-0008).
export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : defaultLocale;
}

type Node = { [key: string]: string | Node };

function merge(base: Node, override: Node): Node {
  const out: Node = {};
  for (const [key, value] of Object.entries(base)) {
    const other = override[key];
    if (typeof value !== 'string') out[key] = merge(value, typeof other === 'object' ? other : {});
    else out[key] = typeof other === 'string' && other !== '' ? other : value;
  }
  return out;
}

// Dictionnaire d'une langue, complété par le français pour les clés non traduites (fallback en → fr).
export function getTranslations(locale: Locale): Dictionary {
  return locale === defaultLocale ? fr : (merge(fr, dictionaries[locale]) as Dictionary);
}

type Path<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Path<T[K], `${P}${K}.`>;
}[keyof T & string];

export function t(locale: Locale, key: Path<Dictionary>): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown>)[part],
      getTranslations(locale),
    );
  return value as string;
}
