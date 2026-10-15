import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { articleStatuses, checkSchedule } from '../../../scripts/checks/lib/blog.ts';

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

const NOW = new Date('2026-06-01T06:00:00Z');
const article = (extra: string) => `---\ntitle: "T"\npubDate: 2026-03-17\n${extra}\n---\n\nCorps\n`;

async function tree(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'blog-schedule-'));
  roots.push(root);
  for (const [path, text] of Object.entries(files)) {
    await mkdir(join(root, dirname(path)), { recursive: true });
    await writeFile(join(root, path), text);
  }
  return root;
}

const SOURCES = {
  'src/content/blog/fr/publie.md': article('draft: false'),
  'src/content/blog/fr/brouillon.md': article('draft: true'),
  'src/content/blog/fr/futur.md': `---\ntitle: "T"\npubDate: 2026-12-01\n---\n\nCorps\n`,
  'src/content/blog/fr/demain-minuit.md': `---\ntitle: "T"\npubDate: 2026-06-02\n---\n\nCorps\n`,
  'src/content/blog/fr/aujourdhui.md': `---\ntitle: "T"\npubDate: 2026-06-01\n---\n\nCorps\n`,
};

describe('articleStatuses', () => {
  it('sépare publiés et non publiés avec la raison (brouillon ou date future)', async () => {
    const root = await tree(SOURCES);
    const { published, unpublished } = await articleStatuses(root, NOW);
    expect(published).toEqual(['aujourdhui', 'publie']);
    expect(unpublished).toEqual([
      { slug: 'brouillon', reason: 'brouillon' },
      { slug: 'demain-minuit', reason: 'date future' },
      { slug: 'futur', reason: 'date future' },
    ]);
  });
});

describe('checkSchedule', () => {
  const published = {
    'dist/blog/publie/index.html': '<html></html>',
    'dist/blog/aujourdhui/index.html': '<html></html>',
    'dist/sitemap-0.xml': '<urlset><url><loc>https://s.test/blog/publie/</loc></url></urlset>',
    'dist/rss.xml': '<rss><item><link>https://s.test/blog/publie/</link></item></rss>',
  };

  it('ne signale rien quand aucun article non publié n’est dans dist/', async () => {
    const root = await tree({ ...SOURCES, ...published });
    expect(await checkSchedule(root, join(root, 'dist'), NOW)).toEqual([]);
  });

  it('détecte la page, l’entrée de sitemap et l’entrée de flux d’un article futur, avec son slug', async () => {
    const root = await tree({
      ...SOURCES,
      ...published,
      'dist/blog/futur/index.html': '<html></html>',
      'dist/sitemap-0.xml':
        '<urlset><loc>https://s.test/blog/publie/</loc><loc>https://s.test/blog/futur/</loc></urlset>',
      'dist/rss.xml': '<rss><link>https://s.test/blog/brouillon/</link></rss>',
    });
    const errors = await checkSchedule(root, join(root, 'dist'), NOW);
    expect(errors).toContain('Article non publié présent dans dist/ : futur (date future)');
    expect(errors).toContain('Article non publié dans le sitemap : futur (date future)');
    expect(errors).toContain('Article non publié dans le flux : brouillon (brouillon)');
    expect(errors).toHaveLength(3);
  });

  it('un article non publié ne bloque pas un article publié dont le slug commence pareil', async () => {
    // « pre » (brouillon) est un préfixe de « pre-suite » (publié) : seule la forme `/blog/pre/` compte.
    const root = await tree({
      ...SOURCES,
      'src/content/blog/fr/pre.md': article('draft: true'),
      'src/content/blog/fr/pre-suite.md': article('draft: false'),
      ...published,
      'dist/blog/pre-suite/index.html': '<html></html>',
      'dist/sitemap-0.xml': '<urlset><loc>https://s.test/blog/pre-suite/</loc></urlset>',
      'dist/rss.xml': '<rss><link>https://s.test/blog/pre-suite/</link></rss>',
    });
    expect(await checkSchedule(root, join(root, 'dist'), NOW)).toEqual([]);
    const leaked = await tree({
      ...SOURCES,
      'src/content/blog/fr/pre.md': article('draft: true'),
      'src/content/blog/fr/pre-suite.md': article('draft: false'),
      'dist/blog/pre/index.html': '<html></html>',
    });
    expect(await checkSchedule(leaked, join(leaked, 'dist'), NOW)).toEqual([
      'Article non publié présent dans dist/ : pre (brouillon)',
    ]);
  });

  it('fonctionne avant la génération du sitemap et du flux (fichiers absents)', async () => {
    const root = await tree({ ...SOURCES, 'dist/blog/publie/index.html': '<html></html>' });
    expect(await checkSchedule(root, join(root, 'dist'), NOW)).toEqual([]);
  });
});
