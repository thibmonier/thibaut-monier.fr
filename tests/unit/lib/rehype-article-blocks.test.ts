import { markdownToHtml } from 'satteri';
import { describe, expect, it, vi } from 'vitest';
import {
  isScrollWrapper,
  rehypeArticleBlocks,
  scrollWrapper,
  visitBlock,
  type BlockContext,
} from '../../../src/lib/rehype-article-blocks.ts';

const render = (markdown: string): string =>
  markdownToHtml(markdown, { hastPlugins: [rehypeArticleBlocks] }).html;

const TABLE = '| A | B |\n|---|---|\n| 1 | 2 |\n';
const CODE = '```bash\nnpm ci\n```\n';

describe('plugin des blocs défilants, rendu réel (Sätteri)', () => {
  it('rend les blocs de code focalisables au clavier', () => {
    expect(render(CODE)).toMatch(/<pre[^>]*\stabindex="0"/);
  });

  it('enveloppe chaque tableau dans une région défilante focalisable et nommée', () => {
    const html = render(TABLE);
    expect(html).toMatch(/<div[^>]*class="table-scroll"[^>]*>\s*<table/);
    expect(html).toMatch(/<div[^>]*role="region"/);
    expect(html).toMatch(/<div[^>]*tabindex="0"/);
    expect(html).toMatch(/<div[^>]*aria-label="[^"]+"/);
  });

  it('enveloppe chaque tableau une seule fois, même avec plusieurs tableaux', () => {
    const html = render(`${TABLE}\nTexte.\n\n${TABLE}`);
    expect(html.match(/class="table-scroll"/g)).toHaveLength(2);
    expect(html.match(/<table/g)).toHaveLength(2);
  });

  it('laisse un document sans bloc inchangé', () => {
    const markdown = '# Titre\n\nUn paragraphe avec `code` en ligne.\n';
    expect(render(markdown)).toBe(markdownToHtml(markdown).html);
  });

  it('n’ajoute aucun attribut style', () => {
    expect(render(`${CODE}\n${TABLE}`)).not.toMatch(/\sstyle=/);
  });

  it('ne rend pas un code en ligne focalisable', () => {
    expect(render('Un `code` en ligne.\n')).not.toContain('tabindex');
  });
});

describe('visitBlock (contexte simulé)', () => {
  const ctx = (parent: unknown) => {
    const calls = { setProperty: vi.fn(), wrapNode: vi.fn(), parent: vi.fn(() => parent) };
    return { calls, context: calls as unknown as BlockContext };
  };

  it('est idempotent : un tableau déjà enveloppé ne l’est pas une seconde fois', () => {
    const { calls, context } = ctx(scrollWrapper);
    visitBlock({ tagName: 'table' }, context);
    expect(calls.wrapNode).not.toHaveBeenCalled();
  });

  it('enveloppe un tableau dont le parent n’est pas la région défilante', () => {
    const { calls, context } = ctx({ type: 'element', tagName: 'div', properties: {} });
    visitBlock({ tagName: 'table' }, context);
    expect(calls.wrapNode).toHaveBeenCalledTimes(1);
  });

  it('ignore les autres éléments', () => {
    const { calls, context } = ctx(undefined);
    visitBlock({ tagName: 'p' }, context);
    expect(calls.setProperty).not.toHaveBeenCalled();
    expect(calls.wrapNode).not.toHaveBeenCalled();
  });

  it('reconnaît la région défilante par sa classe', () => {
    expect(isScrollWrapper(scrollWrapper)).toBe(true);
    expect(isScrollWrapper({ tagName: 'div', properties: { className: ['autre'] } })).toBe(false);
    expect(isScrollWrapper(undefined)).toBe(false);
  });
});
