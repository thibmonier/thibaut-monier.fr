import { describe, expect, it } from 'vitest';
import { homeSchema } from '../../../src/content/schemas/home.ts';

const valid = {
  name: 'Thibaut Monier',
  title: 'Direction technique et delivery',
  contactLink: '/contact/',
};

describe('homeSchema', () => {
  it('accepte une entrée valide', () => {
    expect(homeSchema.safeParse(valid).success).toBe(true);
  });

  it.each(['name', 'title', 'contactLink'] as const)(
    "rejette l'absence de %s avec un message citant le champ et la collection",
    (field) => {
      const { [field]: _omit, ...rest } = valid;
      const r = homeSchema.safeParse(rest);
      expect(r.success).toBe(false);
      expect(r.error?.issues[0]?.message).toBe(`Champ '${field}' requis dans la collection home`);
    },
  );

  it('rejette une clé inconnue', () => {
    expect(homeSchema.safeParse({ ...valid, phone: '0612345678' }).success).toBe(false);
  });
});
