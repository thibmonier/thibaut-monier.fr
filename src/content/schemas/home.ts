import { z } from 'astro/zod';
import { rejectPii, requiredIn } from './common.ts';

const field = (name: string) => z.string(requiredIn('home', name));

// Schéma minimal du walking skeleton ; étendu par US-004.
export const homeSchema = z.strictObject({
  name: field('name').min(1).superRefine(rejectPii),
  title: field('title').min(1).max(80).superRefine(rejectPii),
  contactLink: field('contactLink').startsWith('/'),
});
