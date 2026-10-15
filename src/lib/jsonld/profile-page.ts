import { absoluteUrl } from '../site-url.ts';
import type { JsonLdObject, Site } from './types.ts';

export interface ProfilePageInput {
  path: string;
  name: string;
  person: JsonLdObject;
}

export function buildProfilePage(input: ProfilePageInput, site?: Site): JsonLdObject {
  return {
    '@type': 'ProfilePage',
    name: input.name,
    url: absoluteUrl(input.path, site),
    mainEntity: input.person,
  };
}
