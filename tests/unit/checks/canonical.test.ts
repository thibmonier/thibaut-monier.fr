import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkCanonicals,
  defaultSite,
  expectedOrigin,
  extractCanonicals,
  isNoindex,
} from '../../../scripts/checks/lib/canonical.ts';

const ORIGIN = 'https://site.test';
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const page = (head: string, body = '') =>
  `<!doctype html><html lang="fr"><head>${head}</head><body>${body}</body></html>`;
const canonical = (href: string) => `<link rel="canonical" href="${href}">`;

async function dist(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'canonical-'));
  roots.push(root);
  for (const [path, html] of Object.entries(files)) {
    await mkdir(join(root, dirname(path)), { recursive: true });
    await writeFile(join(root, path), html);
  }
  return root;
}

describe('extractCanonicals et isNoindex', () => {
  it('extrait toutes les balises canonical, quel que soit l’ordre des attributs', () => {
    const html = page(
      `${canonical('https://a.test/')}<link href="https://b.test/" rel="canonical">`,
    );
    expect(extractCanonicals(html)).toEqual(['https://a.test/', 'https://b.test/']);
    expect(extractCanonicals(page('<link rel="icon" href="/x.svg">'))).toEqual([]);
  });

  it('reconnaît robots noindex', () => {
    expect(isNoindex(page('<meta name="robots" content="noindex">'))).toBe(true);
    expect(isNoindex(page('<meta name="robots" content="noindex, nofollow">'))).toBe(true);
    expect(isNoindex(page('<meta name="description" content="noindex">'))).toBe(false);
  });
});

describe('expectedOrigin et defaultSite', () => {
  it('lit PUBLIC_SITE_URL, sinon le site par défaut d’astro.config.mjs', () => {
    expect(
      expectedOrigin({ PUBLIC_SITE_URL: 'https://prod.test/chemin' }, 'https://defaut.test'),
    ).toBe('https://prod.test');
    expect(expectedOrigin({ PUBLIC_SITE_URL: '' }, 'https://defaut.test')).toBe(
      'https://defaut.test',
    );
    expect(expectedOrigin({}, 'https://defaut.test')).toBe('https://defaut.test');
  });

  it('extrait le site par défaut du texte de la configuration', () => {
    const config = "const site = process.env.PUBLIC_SITE_URL || 'https://thibaut-monier.fr';";
    expect(defaultSite(config)).toBe('https://thibaut-monier.fr');
    expect(() => defaultSite('rien')).toThrow('Site par défaut introuvable');
  });
});

describe('checkCanonicals', () => {
  const good = page(canonical(`${ORIGIN}/blog/a/`));

  it('accepte une canonical absolue, autoréférente, sur l’origine attendue', async () => {
    const root = await dist({
      'blog/a/index.html': good,
      'index.html': page(canonical(`${ORIGIN}/`)),
    });
    expect(await checkCanonicals(root, ORIGIN)).toEqual([]);
  });

  it('signale l’absence de canonical sur une page indexable', async () => {
    const root = await dist({ 'blog/a/index.html': page('') });
    const errors = await checkCanonicals(root, ORIGIN);
    expect(errors).toEqual([`/blog/a/ : Canonical invalide : aucune balise (attendu ${ORIGIN}/…)`]);
  });

  it('signale deux balises canonical', async () => {
    const root = await dist({
      'blog/a/index.html': page(
        `${canonical(`${ORIGIN}/blog/a/`)}${canonical(`${ORIGIN}/blog/a/`)}`,
      ),
    });
    expect((await checkCanonicals(root, ORIGIN))[0]).toContain(
      '/blog/a/ : Canonical invalide : 2 balises',
    );
  });

  it('signale une URL relative', async () => {
    const root = await dist({ 'blog/a/index.html': page(canonical('/blog/a/')) });
    expect(await checkCanonicals(root, ORIGIN)).toEqual([
      `/blog/a/ : Canonical invalide : /blog/a/ (attendu ${ORIGIN}/…)`,
    ]);
  });

  it('signale le domaine de l’ancien site', async () => {
    const root = await dist({
      'blog/a/index.html': page(canonical('https://agentic-agency.fr/blog/a/')),
    });
    expect(await checkCanonicals(root, ORIGIN)).toEqual([
      `/blog/a/ : Canonical invalide : https://agentic-agency.fr/blog/a/ (attendu ${ORIGIN}/…)`,
    ]);
  });

  it('signale une canonical qui ne pointe pas sur la page elle-même', async () => {
    const root = await dist({ 'blog/a/index.html': page(canonical(`${ORIGIN}/blog/b/`)) });
    expect((await checkCanonicals(root, ORIGIN))[0]).toContain(
      `Canonical invalide : ${ORIGIN}/blog/b/`,
    );
  });

  it('exclut les pages noindex et refuse qu’elles portent une canonical', async () => {
    const noindex = '<meta name="robots" content="noindex">';
    const root = await dist({ 'recherche/index.html': page(noindex) });
    expect(await checkCanonicals(root, ORIGIN)).toEqual([]);
    const wrong = await dist({
      'recherche/index.html': page(`${noindex}${canonical(`${ORIGIN}/recherche/`)}`),
    });
    expect(await checkCanonicals(wrong, ORIGIN)).toEqual([
      '/recherche/ : page noindex avec une balise canonical',
    ]);
  });

  it('ignore les fichiers HTML qui ne sont pas des pages (404, 50x)', async () => {
    const root = await dist({
      '404.html': page(''),
      '50x.html': page(''),
      'index.html': page(canonical(`${ORIGIN}/`)),
    });
    expect(await checkCanonicals(root, ORIGIN)).toEqual([]);
  });
});
