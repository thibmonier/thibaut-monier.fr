import type { JsonLdObject } from './types.ts';

export type { JsonLdObject } from './types.ts';

// Un bloc `application/ld+json` ne s'exécute pas, mais `</script>` dans une valeur fermerait la balise :
// `<`, `>` et `&` sont échappés en séquences Unicode (le JSON reste identique une fois analysé).
const ESCAPES: Record<string, string> = { '<': '\\u003c', '>': '\\u003e', '&': '\\u0026' };

/** Une chaîne JSON par objet, avec `@context` ; les entrées nulles (type absent) sont ignorées. */
export function serializeJsonLd(objects: (JsonLdObject | null | undefined)[]): string[] {
  return objects
    .filter((object): object is JsonLdObject => object != null)
    .map((object) =>
      JSON.stringify({ '@context': 'https://schema.org', ...object }).replace(
        /[<>&]/g,
        (char) => ESCAPES[char] as string,
      ),
    );
}
