export type Axis = 'performance' | 'accessibility' | 'best-practices' | 'seo';
export type Scores = Record<Axis, number>;

export const AXES: ReadonlyArray<readonly [Axis, string]> = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['best-practices', 'Best Practices'],
  ['seo', 'SEO'],
];

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

export function medianScores(runs: Scores[]): Scores {
  const byAxis = (axis: Axis) => median(runs.map((run) => run[axis]));
  return {
    performance: byAxis('performance'),
    accessibility: byAxis('accessibility'),
    'best-practices': byAxis('best-practices'),
    seo: byAxis('seo'),
  };
}

// Un message par axe sous le seuil : « Accessibility score 0.92 < 0.95 ».
export function assertScores(scores: Scores, threshold: number): string[] {
  return AXES.filter(([axis]) => scores[axis] < threshold).map(
    ([axis, label]) => `${label} score ${scores[axis].toFixed(2)} < ${threshold.toFixed(2)}`,
  );
}
