import { describe, expect, it } from 'vitest';
import { STALE_AFTER_DAYS, isStale, isoDay } from '../../../src/lib/oss-metrics.ts';

describe('isoDay', () => {
  it('formate la date du jour de la donnée en UTC (AAAA-MM-JJ)', () => {
    expect(isoDay(new Date('2026-10-14T23:59:59Z'))).toBe('2026-10-14');
  });
});

describe('isStale', () => {
  const fetchedAt = new Date('2026-10-01T00:00:00Z');

  it('est périmé au-delà de 7 jours', () => {
    expect(STALE_AFTER_DAYS).toBe(7);
    expect(isStale(fetchedAt, new Date('2026-10-08T00:00:01Z'))).toBe(true);
  });

  it('ne l’est pas à 7 jours pile', () => {
    expect(isStale(fetchedAt, new Date('2026-10-08T00:00:00Z'))).toBe(false);
  });
});
