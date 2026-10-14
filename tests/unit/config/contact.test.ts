import { describe, expect, it } from 'vitest';
import { buildContactConfig } from '../../../src/config/contact.ts';

describe('buildContactConfig', () => {
  it('lit la clé et l’URL de RDV depuis l’environnement', () => {
    const config = buildContactConfig({
      PUBLIC_WEB3FORMS_KEY: 'abc',
      PUBLIC_CALENDLY_URL: 'https://calendly.com/x/echange-decouverte',
    });
    expect(config.web3formsKey).toBe('abc');
    expect(config.rdvUrl).toBe('https://calendly.com/x/echange-decouverte');
    expect(config.motifs.map((m) => m.id)).toEqual(['mission', 'poste', 'autre']);
  });

  it('traite les variables absentes ou vides comme optionnelles', () => {
    const config = buildContactConfig({ PUBLIC_WEB3FORMS_KEY: '  ', PUBLIC_CALENDLY_URL: '' });
    expect(config.web3formsKey).toBeUndefined();
    expect(config.rdvUrl).toBeUndefined();
    expect(buildContactConfig({}).web3formsKey).toBeUndefined();
  });

  it('refuse une URL de RDV non https', () => {
    expect(() => buildContactConfig({ PUBLIC_CALENDLY_URL: 'http://calendly.com/x' })).toThrow();
  });
});
