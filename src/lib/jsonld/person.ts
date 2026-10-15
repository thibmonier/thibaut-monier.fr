import { absoluteUrl } from '../site-url.ts';
import type { JsonLdObject, Site } from './types.ts';

// Liste blanche de `Person` (décision du 2026-10-15, docs/guides/seo-technique.md) : rien d'autre ne sort.
const ALLOWED = new Set(['@context', '@type', 'name', 'jobTitle', 'url', 'sameAs', 'address']);

export interface PersonInput {
  name: string;
  jobTitle: string;
  sameAs: string[];
  /** Pays seulement (code ISO) : jamais d'adresse précise. */
  country: string;
}

export function buildPerson(input: PersonInput, site?: Site): JsonLdObject {
  return {
    '@type': 'Person',
    name: input.name,
    jobTitle: input.jobTitle,
    url: absoluteUrl('/', site),
    sameAs: [...input.sameAs],
    address: { '@type': 'PostalAddress', addressCountry: input.country },
  };
}

function isCountryOnly(address: unknown): boolean {
  if (typeof address !== 'object' || address === null) return false;
  return Object.keys(address).every((key) => key === '@type' || key === 'addressCountry');
}

export function assertPersonProperties(person: Record<string, unknown>): void {
  for (const key of Object.keys(person)) {
    if (!ALLOWED.has(key) || (key === 'address' && !isCountryOnly(person[key]))) {
      throw new Error(`JSON-LD Person : propriété interdite '${key}'`);
    }
  }
}
