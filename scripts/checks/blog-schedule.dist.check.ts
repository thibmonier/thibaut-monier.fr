import { checkSchedule } from './lib/blog.ts';
import type { CheckContext } from './lib/runner.ts';

export default function check({ root, distDir }: CheckContext): Promise<string[]> {
  return checkSchedule(root, distDir);
}
