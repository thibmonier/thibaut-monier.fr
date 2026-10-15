import { describe, expect, it } from 'vitest';
import { assertPersonProperties, buildPerson } from '../../../../src/lib/jsonld/person.ts';

const SITE = 'https://thibaut-monier.fr';
const input = {
  name: 'Thibaut Monier',
  jobTitle: 'Directeur de projets IT',
  sameAs: ['https://www.linkedin.com/in/thibautmonier/', 'https://github.com/thibmonier'],
  country: 'FR',
};

describe('buildPerson', () => {
  it('produit la liste blanche et rien d’autre', () => {
    expect(buildPerson(input, SITE)).toEqual({
      '@type': 'Person',
      name: 'Thibaut Monier',
      jobTitle: 'Directeur de projets IT',
      url: 'https://thibaut-monier.fr/',
      sameAs: input.sameAs,
      address: { '@type': 'PostalAddress', addressCountry: 'FR' },
    });
  });

  it('ignore toute propriété d’entrée hors liste blanche', () => {
    const person = buildPerson({ ...input, telephone: '0102030405' } as typeof input, SITE);
    expect(Object.keys(person)).not.toContain('telephone');
  });
});

describe('assertPersonProperties', () => {
  const ok = { '@type': 'Person', name: 'T', url: 'https://x.fr/' };

  it('accepte la liste blanche', () => {
    expect(() => assertPersonProperties(buildPerson(input, SITE))).not.toThrow();
    expect(() => assertPersonProperties(ok)).not.toThrow();
  });

  it.each(['telephone', 'birthDate'])('refuse « %s »', (property) => {
    expect(() => assertPersonProperties({ ...ok, [property]: 'x' })).toThrow(
      `JSON-LD Person : propriété interdite '${property}'`,
    );
  });

  it('refuse une adresse précise mais accepte le pays seul', () => {
    const precise = { ...ok, address: { '@type': 'PostalAddress', streetAddress: '1 rue X' } };
    expect(() => assertPersonProperties(precise)).toThrow(
      "JSON-LD Person : propriété interdite 'address'",
    );
    const country = { ...ok, address: { '@type': 'PostalAddress', addressCountry: 'FR' } };
    expect(() => assertPersonProperties(country)).not.toThrow();
  });
});
