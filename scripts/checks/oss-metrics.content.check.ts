import { OSS_TARGETS, metricsKey } from '../lib/oss-targets.ts';
import { checkOssMetrics } from './lib/oss-metrics.ts';
import type { CheckContext } from './lib/runner.ts';

export default async function check({ root }: CheckContext): Promise<string[]> {
  const { errors, warnings } = await checkOssMetrics(root, OSS_TARGETS.map(metricsKey));
  for (const warning of warnings) console.warn(`AVERTISSEMENT ${warning}`);
  return errors;
}
