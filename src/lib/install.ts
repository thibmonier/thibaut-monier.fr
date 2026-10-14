// Commande d'installation d'une fiche (US-020). Vendor Packagist « tmonier », distinct de l'organisation GitHub.
export const PACKAGIST_VENDOR = 'tmonier';

export const composerRequire = (pkg: string): string => `composer require ${pkg}`;

export function installPackage(plugin: {
  packagist?: string | undefined;
  repo: { name: string };
}): {
  name: string;
  published: boolean;
} {
  return plugin.packagist
    ? { name: plugin.packagist, published: true }
    : { name: `${PACKAGIST_VENDOR}/${plugin.repo.name}`, published: false };
}
