// Preuves de la page d'accueil : chaque chiffre renvoie à un contenu consultable (US-004).

export const PROOF_COUNT = 4;

export interface ProofRef {
  id: string;
  link: string;
}

export const invalidProofMessage = (id: string): string => `Lien de preuve invalide : ${id}`;

const isInternal = (link: string): boolean => link.startsWith('/') && !link.startsWith('//');

// Chemin d'un lien interne sans requête ni ancre (`/contact/?motif=poste` -> `/contact/`).
const pathOf = (link: string): string => link.split(/[?#]/u)[0] as string;

function isHttpsUrl(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.hostname !== '';
  } catch {
    return false;
  }
}

// Forme du lien, sans consulter les routes : interne (`/chemin/`) ou externe en https.
export function isWellFormedProofLink(link: string): boolean {
  return isInternal(link) ? pathOf(link).endsWith('/') : isHttpsUrl(link);
}

export function validateProofs(proofs: readonly ProofRef[], routes: ReadonlySet<string>): string[] {
  if (proofs.length !== PROOF_COUNT) {
    return [`Il faut exactement ${PROOF_COUNT} preuves (reçu : ${proofs.length})`];
  }
  return proofs
    .filter((proof) =>
      isInternal(proof.link) ? !routes.has(pathOf(proof.link)) : !isHttpsUrl(proof.link),
    )
    .map((proof) => invalidProofMessage(proof.id));
}
