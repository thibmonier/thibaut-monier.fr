import { checkRss } from './lib/rss.ts';
import type { CheckContext } from './lib/runner.ts';

// US-013 : flux RSS valide, 20 articles au plus, seuls les articles publiés.
export default function check({ distDir }: CheckContext): Promise<string[]> {
  return checkRss(distDir);
}
