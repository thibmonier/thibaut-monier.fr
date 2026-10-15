import { checkOg } from './lib/og.ts';
import type { CheckContext } from './lib/runner.ts';

// US-025 : images de partage présentes, en PNG 1200 × 630 de moins de 300 Ko. Relève le nombre d'images,
// le poids total et la plus lourde (documentés dans docs/guides/images-og.md).
export default async function check({ distDir }: CheckContext): Promise<string[]> {
  const report = await checkOg(distDir);
  console.log(
    `Images Open Graph : ${report.count}, ${Math.round(report.totalBytes / 1024)} Ko au total, la plus lourde ${Math.round(report.heaviest / 1024)} Ko`,
  );
  return report.errors;
}
