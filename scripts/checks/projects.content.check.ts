import { checkProjects } from './lib/projects.ts';
import type { CheckContext } from './lib/runner.ts';

export default function check({ root }: CheckContext): Promise<string[]> {
  return checkProjects(root);
}
