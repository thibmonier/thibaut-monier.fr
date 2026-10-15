import { describe, expect, it } from 'vitest';
import { buildPerson } from '../../../../src/lib/jsonld/person.ts';
import { buildProfilePage } from '../../../../src/lib/jsonld/profile-page.ts';

const SITE = 'https://thibaut-monier.fr';

describe('buildProfilePage', () => {
  const person = buildPerson(
    { name: 'Thibaut Monier', jobTitle: 'CTO', sameAs: [], country: 'FR' },
    SITE,
  );
  const page = buildProfilePage(
    { path: '/parcours/', name: 'Parcours professionnel', person },
    SITE,
  );

  it('est une ProfilePage dont l’entité principale est la personne', () => {
    expect(page['@type']).toBe('ProfilePage');
    expect(page['mainEntity']).toEqual(person);
  });

  it('porte une URL absolue', () => {
    expect(page['url']).toBe('https://thibaut-monier.fr/parcours/');
    expect(page['name']).toBe('Parcours professionnel');
  });
});
