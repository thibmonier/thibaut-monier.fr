// Calcul du ratio de contraste WCAG 2.x (https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio).

function parseHex(color: string): [number, number, number] {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (!match) throw new Error(`Couleur invalide : « ${color} » (attendu #rgb ou #rrggbb)`);
  const hex =
    (match[1] as string).length === 3
      ? [...(match[1] as string)].map((c) => c + c).join('')
      : (match[1] as string);
  const n = Number.parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function relativeLuminance(color: string): number {
  const [r, g, b] = parseHex(color).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}
