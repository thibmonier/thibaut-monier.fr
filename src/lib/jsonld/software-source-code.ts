import { absoluteUrl } from '../site-url.ts';
import type { JsonLdObject, Site } from './types.ts';

export interface SoftwareSourceCodeInput {
  name: string;
  description: string;
  path: string;
  repoUrl: string;
  /** Identifiant SPDX (`MIT`). */
  license: string;
  version?: string | undefined;
}

export function buildSoftwareSourceCode(input: SoftwareSourceCodeInput, site?: Site): JsonLdObject {
  return {
    '@type': 'SoftwareSourceCode',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, site),
    codeRepository: input.repoUrl,
    license: `https://spdx.org/licenses/${input.license}`,
    programmingLanguage: 'PHP',
    ...(input.version ? { version: input.version } : {}),
  };
}
