import { articleStatuses } from './lib/blog.ts';
import { checkPagefind } from './lib/pagefind.ts';
import type { CheckContext } from './lib/runner.ts';

// L'index indexe exactement les articles publiés (les pages sans `data-pagefind-body` n'y entrent pas).
export default async function check({ root, distDir }: CheckContext): Promise<string[]> {
  const { published } = await articleStatuses(root);
  return checkPagefind(distDir, published.length);
}
