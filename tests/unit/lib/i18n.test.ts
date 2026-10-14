import { describe, expect, it } from 'vitest';
import { en } from '../../../src/i18n/en.ts';
import { fr } from '../../../src/i18n/fr.ts';
import { getTranslations, localeFromPath, t } from '../../../src/i18n/utils.ts';

describe('dictionnaires', () => {
  it('en.ts reprend exactement la structure de fr.ts (squelette sans traduction)', () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        typeof v === 'object' ? keys(v).map((s) => `${k}.${s}`) : [k],
      );
    expect(keys(en)).toEqual(keys(fr));
  });
});

describe('localeFromPath', () => {
  it('traite le français sans préfixe comme langue par défaut', () => {
    expect(localeFromPath('/')).toBe('fr');
    expect(localeFromPath('/contact/')).toBe('fr');
  });

  it('reconnaît le préfixe /en/', () => {
    expect(localeFromPath('/en/')).toBe('en');
    expect(localeFromPath('/en/contact/')).toBe('en');
    expect(localeFromPath('/entreprise/')).toBe('fr');
  });
});

describe('t / getTranslations', () => {
  it('lit un libellé par clé pointée', () => {
    expect(t('fr', 'skipLink')).toBe('Aller au contenu');
  });

  it('retombe sur le français quand la clé anglaise est vide (fallback en → fr)', () => {
    expect(t('en', 'skipLink')).toBe('Aller au contenu');
    expect(getTranslations('en').nav.main).toBe(fr.nav.main);
  });
});
