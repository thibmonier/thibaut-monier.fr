import { describe, expect, it } from 'vitest';
import {
  PDF_PII_MESSAGE,
  evaluateCvPdf,
  findForbiddenPatterns,
  parseLinkedPages,
  parsePdfInfo,
  type CvPdfFacts,
} from '../../../scripts/checks/lib/pdf-privacy.ts';

describe('findForbiddenPatterns', () => {
  it.each([
    ['Tél : 06.61.33.09.02', 'telephone'],
    ['Tél : 06 61 33 09 02', 'telephone'],
    ['Joignable au +33 6 61 33 09 02', 'telephone'],
    ['Âge : 50 ans', 'age'],
    ['Né le 3 mars', 'naissance'],
    ['12 rue des Lilas, Nantes', 'adresse'],
  ])('refuse %s', (text, type) => {
    expect(findForbiddenPatterns(text)).toContain(type);
  });

  it('accepte « 25 ans d’expérience » (arbitrage A1)', () => {
    expect(findForbiddenPatterns('Plus de 25 ans d’expérience en IT.')).toEqual([]);
  });

  it('détecte un numéro coupé par un retour à la ligne ou une espace insécable', () => {
    expect(findForbiddenPatterns('06 61\n33 09 02')).toContain('telephone');
    expect(findForbiddenPatterns('06 61 33 09 02')).toContain('telephone');
  });

  it('accepte un texte sans donnée personnelle', () => {
    expect(findForbiddenPatterns('Nantes (France) — Delivery Manager, 2021 – 2025')).toEqual([]);
  });
});

describe('parsePdfInfo', () => {
  const output = [
    'Title:           Thibaut Monier – CV',
    'Author:          Thibaut Monier',
    'Tagged:          yes',
    'Pages:           2',
    'Page size:       595.276 x 841.89 pts (A4)',
  ].join('\n');

  it('extrait titre, auteur, pages et balisage', () => {
    expect(parsePdfInfo(output)).toMatchObject({
      title: 'Thibaut Monier – CV',
      author: 'Thibaut Monier',
      pages: 2,
      tagged: true,
    });
  });

  it('lit la langue dans les métadonnées XMP', () => {
    expect(
      parsePdfInfo(`${output}\n<dc:language><rdf:Bag><rdf:li>fr</rdf:li></rdf:Bag></dc:language>`)
        .lang,
    ).toBe('fr');
  });

  it('retourne 0 page et pas de titre quand la sortie est vide', () => {
    expect(parsePdfInfo('')).toMatchObject({ pages: 0, tagged: false });
    expect(parsePdfInfo('').title).toBeUndefined();
  });
});

describe('parseLinkedPages', () => {
  it('lit le nombre de pages annoncé par le lien de téléchargement', () => {
    const html =
      '<a data-cv-download href="/thibaut-monier-cv.pdf" download>Télécharger mon CV (PDF, 2 pages)</a>';
    expect(parseLinkedPages(html)).toBe(2);
  });

  it('retourne null sans lien ou sans nombre de pages', () => {
    expect(parseLinkedPages('<p>rien</p>')).toBeNull();
    expect(parseLinkedPages('<a data-cv-download href="/x.pdf">Mon CV</a>')).toBeNull();
  });
});

const facts = (overrides: Partial<CvPdfFacts> = {}): CvPdfFacts => ({
  sizeBytes: 120_000,
  text: 'Thibaut Monier\nGINGERMINDS Delivery Manager\nSmile\nSQLI',
  info: { pages: 2, title: 'Thibaut Monier – CV', lang: 'fr', tagged: true },
  linkedPages: 2,
  companies: ['GINGERMINDS', 'Smile', 'SQLI'],
  ...overrides,
});

describe('evaluateCvPdf', () => {
  it('ne signale rien pour un PDF conforme', () => {
    expect(evaluateCvPdf(facts())).toEqual([]);
  });

  it('échoue avec le message exact de l’US sur une donnée personnelle', () => {
    expect(PDF_PII_MESSAGE).toBe(
      'CV public : donnée personnelle interdite (téléphone, âge ou adresse)',
    );
    expect(evaluateCvPdf(facts({ text: 'Tél : 06 61 33 09 02 GINGERMINDS Smile SQLI' }))).toContain(
      PDF_PII_MESSAGE,
    );
  });

  it('accepte « 25 ans d’expérience »', () => {
    expect(evaluateCvPdf(facts({ text: '25 ans d’expérience. GINGERMINDS Smile SQLI' }))).toEqual(
      [],
    );
  });

  it('refuse un PDF non balisé (lecture accessible)', () => {
    const errors = evaluateCvPdf(
      facts({ info: { pages: 2, title: 't', lang: 'fr', tagged: false } }),
    );
    expect(errors).toEqual(['CV PDF : PDF non balisé (lecture accessible impossible)']);
  });

  it('refuse un fichier de plus de 500 Ko', () => {
    expect(evaluateCvPdf(facts({ sizeBytes: 500 * 1024 + 1 })).join()).toMatch(/500 Ko/);
  });

  it('refuse un nombre de pages différent de celui du lien', () => {
    const errors = evaluateCvPdf(
      facts({ info: { pages: 3, tagged: true, lang: 'fr', title: 't' } }),
    );
    expect(errors.join()).toMatch(/3 pages/);
  });

  it('refuse un PDF sans lien de téléchargement annonçant le nombre de pages', () => {
    expect(evaluateCvPdf(facts({ linkedPages: null })).join()).toMatch(/lien/);
  });

  it('refuse un PDF de plus de 2 pages même si le lien l’annonce', () => {
    const errors = evaluateCvPdf(
      facts({ linkedPages: 3, info: { pages: 3, title: 't', lang: 'fr', tagged: true } }),
    );
    expect(errors.join()).toMatch(/2 pages/);
  });

  it('signale une entreprise absente du texte, sans tenir compte des retours à la ligne', () => {
    expect(evaluateCvPdf(facts({ text: 'GINGERMINDS Smile' })).join()).toContain('SQLI');
    expect(
      evaluateCvPdf(
        facts({
          text: 'Consultant\nindépendant GINGERMINDS Smile SQLI',
          companies: ['Consultant indépendant'],
        }),
      ),
    ).toEqual([]);
  });

  it('signale un texte de la source absent du PDF (source unique)', () => {
    const errors = evaluateCvPdf(facts({ expectedTexts: ['Texte\u00a0absent de la source'] }));
    expect(errors.join()).toContain('texte de la source absent');
    expect(evaluateCvPdf(facts({ expectedTexts: ['GINGERMINDS   Delivery'] }))).toEqual([]);
  });

  it('exige un titre et la langue fr dans les métadonnées', () => {
    expect(evaluateCvPdf(facts({ info: { pages: 2, tagged: true } })).join()).toMatch(/titre/);
    expect(evaluateCvPdf(facts({ info: { pages: 2, title: 't', tagged: true } })).join()).toMatch(
      /langue/,
    );
  });
});
