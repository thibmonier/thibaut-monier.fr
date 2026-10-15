// Types écrits à la main (aucune dépendance `schema-dts`). Les builders renvoient des objets sans `@context` :
// `serializeJsonLd` l'ajoute, une seule fois, à la sérialisation.
export type JsonLdObject = { '@type': string } & Record<string, unknown>;

/** Origine du site : `import.meta.env.SITE` par défaut (Astro), explicite dans les tests et les scripts Node. */
export type Site = string | URL | undefined;
