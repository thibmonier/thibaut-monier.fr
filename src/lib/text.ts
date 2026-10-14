// Mots d'un texte : séquences séparées par des espaces (insécables compris) contenant une lettre ou un chiffre.
export function countWords(text: string): number {
  return text.split(/\s+/u).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}
