import { detectPii } from '../../../src/lib/privacy.ts';

export interface LegalSource {
  file: string;
  text: string;
}

// Message exigé par US-029 : « Donnée personnelle interdite dans <fichier> : <type> ».
export function scanLegalSources(sources: readonly LegalSource[]): string[] {
  return sources.flatMap(({ file, text }) =>
    detectPii(text).map((type) => `Donnée personnelle interdite dans ${file} : ${type}`),
  );
}
