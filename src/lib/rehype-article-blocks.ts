import { defineHastPlugin } from 'satteri';

// Plugin « blocs défilants » (T-009-06/07). Les blocs de code (`pre`) et les tableaux des articles débordent à
// 360 px : une zone défilante doit être atteignable au clavier (WCAG 2.1.1, règle axe scrollable-region-focusable).
// Astro 7 rend le Markdown avec Sätteri par défaut (les plugins rehype/remark exigent `@astrojs/markdown-remark`) :
// ce plugin est donc un plugin HAST de Sätteri, déclaré dans `astro.config.mjs` via `satteri({ hastPlugins })`.
// Aucun attribut `style` (CSP `style-src 'self'`, ADR-0009) : la mise en forme passe par `article.css` (lot A).

export const SCROLL_WRAPPER_CLASS = 'table-scroll';
export const TABLE_LABEL = 'Tableau, défilable horizontalement';

/** Partie du contexte du visiteur Sätteri utilisée ici (permet de tester sans le moteur natif). */
export interface BlockContext {
  setProperty(node: never, key: string, value: unknown): void;
  wrapNode(node: never, wrapper: never): void;
  parent(node: never): unknown;
}

interface ElementLike {
  tagName?: string;
  properties?: Record<string, unknown>;
}

export function isScrollWrapper(node: unknown): boolean {
  const element = node as ElementLike | undefined;
  const classes = element?.properties?.className;
  return (
    element?.tagName === 'div' && Array.isArray(classes) && classes.includes(SCROLL_WRAPPER_CLASS)
  );
}

export const scrollWrapper = {
  type: 'element',
  tagName: 'div',
  properties: {
    className: [SCROLL_WRAPPER_CLASS],
    tabIndex: 0,
    role: 'region',
    ariaLabel: TABLE_LABEL,
  },
  children: [],
} as const;

/** `pre` : focalisable ; `table` : enveloppé une seule fois dans une région défilante focalisable et nommée. */
export function visitBlock(node: { tagName: string }, ctx: BlockContext): void {
  const target = node as never;
  if (node.tagName === 'pre') {
    ctx.setProperty(target, 'tabIndex', 0);
  } else if (node.tagName === 'table' && !isScrollWrapper(ctx.parent(target))) {
    ctx.wrapNode(target, structuredClone(scrollWrapper) as never);
  }
}

export const rehypeArticleBlocks = defineHastPlugin({
  name: 'article-blocks',
  element: {
    filter: ['pre', 'table'],
    visit: (node, ctx) => visitBlock(node as { tagName: string }, ctx as unknown as BlockContext),
  },
});
