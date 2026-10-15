import { checkMeta } from './lib/meta.ts';
import type { CheckContext } from './lib/runner.ts';

// US-024 : longueur et unicité des titres et descriptions. CHECK_META_EXCLUDE_BLOG=1 limite le contrôle aux
// pages hors blog tant que les articles ne sont pas relus.
export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkMeta(distDir, { excludeBlog: process.env.CHECK_META_EXCLUDE_BLOG === '1' });
}
