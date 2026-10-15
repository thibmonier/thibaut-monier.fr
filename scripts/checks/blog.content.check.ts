import { checkBlog } from './lib/blog.ts';
import type { CheckContext } from './lib/runner.ts';

export default async function check({ root }: CheckContext): Promise<string[]> {
  const report = await checkBlog(root);
  for (const note of report.skipped) console.warn(`AVERTISSEMENT ${note}`);
  console.log(`Blog : articles validés ${report.validated}/${report.total}`);
  return report.errors;
}
