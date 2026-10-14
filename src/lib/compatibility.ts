export interface MatrixRow {
  sylius: string;
  php: string;
  symfony: readonly string[];
}

// Vérifié dans les composer.json : sylius/sylius 2.3 exige php ^8.3 et Symfony ^6.4 || ^7.4 || ^8.0 ;
// Symfony 8 exige PHP 8.4. Sylius 2.2 : PHP >=8.2, Symfony 6.4 et 7.4 seulement.
const MIN_PHP: Record<string, string> = { '2.2': '8.2', '2.3': '8.3' };

const minor = (label: string): string[] => label.match(/\b2\.\d+/g) ?? [];
const phpMin = (php: string): number => Number.parseFloat(/\d+\.\d+/.exec(php)?.[0] ?? '0');

function checkRow(row: MatrixRow): string[] {
  const versions = minor(row.sylius);
  if (versions.length !== 1)
    return [
      versions.length > 1
        ? `Sylius « ${row.sylius} » : une ligne par version mineure`
        : `Sylius « ${row.sylius} » : version non prise en charge (2.2 ou 2.3)`,
    ];
  const version = versions[0] as string;
  const min = MIN_PHP[version];
  if (min === undefined)
    return [`Sylius « ${row.sylius} » : version non prise en charge (2.2 ou 2.3)`];
  const errors: string[] = [];
  if (phpMin(row.php) < Number.parseFloat(min))
    errors.push(`Sylius ${version} : PHP >=${min} exigé (${row.php} déclaré)`);
  for (const symfony of row.symfony.filter((s) => s.startsWith('8'))) {
    if (version !== '2.3') errors.push(`Sylius ${version} : Symfony 8 exige Sylius 2.3`);
    else if (!symfony.includes('PHP 8.4'))
      errors.push(`Sylius ${version} : Symfony ${symfony} sans mention « PHP 8.4 requis »`);
  }
  return errors;
}

export function findCompatibilityErrors(matrix: readonly MatrixRow[]): string[] {
  return matrix.flatMap(checkRow);
}
