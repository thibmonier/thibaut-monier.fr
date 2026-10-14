import { describe, expect, it } from 'vitest';
import { legalFrontmatterSchema } from '../../../src/content/schemas/legal.ts';

const base = { title: 'Mentions légales', description: 'Éditeur et hébergeur.' };

describe('legalFrontmatterSchema', () => {
  it('accepte un frontmatter complet', () => {
    const data = legalFrontmatterSchema.parse({ ...base, updatedDate: '2026-10-14' });
    expect(data.updatedDate).toBeInstanceOf(Date);
  });

  it.each(['title', 'description', 'updatedDate'])('exige le champ %s', (field) => {
    const input: Record<string, unknown> = { ...base, updatedDate: '2026-10-14' };
    delete input[field];
    const result = legalFrontmatterSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain(`Champ '${field}' requis`);
  });

  it('refuse un champ inconnu et une date invalide', () => {
    expect(
      legalFrontmatterSchema.safeParse({ ...base, updatedDate: '2026-10-14', extra: 1 }).success,
    ).toBe(false);
    expect(legalFrontmatterSchema.safeParse({ ...base, updatedDate: 'hier' }).success).toBe(false);
  });
});
