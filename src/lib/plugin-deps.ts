// Dépendances entre plugins (US-020) : « Nécessite » (requires), « Complété par » (complements),
// « Utilisé par » (inverse de requires) et contrôle des références (V4, V5).
export interface DepNode {
  slug: string;
  requires: readonly string[];
  complements: readonly string[];
  externalRequires: readonly string[];
}

export interface Dependencies {
  requires: string[];
  complements: string[];
  usedBy: string[];
  externalRequires: string[];
  isEmpty: boolean;
}

export function computeDependencies(nodes: readonly DepNode[], slug: string): Dependencies {
  const self = nodes.find((n) => n.slug === slug);
  const requires = [...(self?.requires ?? [])];
  const complements = [...(self?.complements ?? [])];
  const externalRequires = [...(self?.externalRequires ?? [])];
  const usedBy = nodes
    .filter((n) => n.requires.includes(slug))
    .map((n) => n.slug)
    .sort();
  return {
    requires,
    complements,
    usedBy,
    externalRequires,
    isEmpty: requires.length + complements.length + externalRequires.length === 0,
  };
}

function findCycle(nodes: readonly DepNode[]): string[] | null {
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));
  const visiting: string[] = [];
  const done = new Set<string>();
  const visit = (slug: string): string[] | null => {
    if (done.has(slug)) return null;
    const at = visiting.indexOf(slug);
    if (at >= 0) return [...visiting.slice(at), slug];
    visiting.push(slug);
    for (const next of bySlug.get(slug)?.requires ?? []) {
      const cycle = bySlug.has(next) ? visit(next) : null;
      if (cycle) return cycle;
    }
    visiting.pop();
    done.add(slug);
    return null;
  };
  for (const node of nodes) {
    const cycle = visit(node.slug);
    if (cycle) return cycle;
  }
  return null;
}

export function findDependencyErrors(nodes: readonly DepNode[]): string[] {
  const known = new Set(nodes.map((n) => n.slug));
  const errors: string[] = [];
  for (const node of nodes) {
    for (const dep of [...node.requires, ...node.complements]) {
      if (dep === node.slug) errors.push(`Plugin « ${node.slug} » : s'auto-référence « ${dep} »`);
      else if (!known.has(dep)) {
        errors.push(
          `Plugin « ${node.slug} » : la dépendance « ${dep} » n'existe pas dans la collection`,
        );
      }
    }
    for (const dep of node.requires.filter((r) => node.complements.includes(r))) {
      errors.push(`Plugin « ${node.slug} » : « ${dep} » est requis et complémentaire à la fois`);
    }
  }
  const cycle = findCycle(nodes);
  if (cycle) errors.push(`Dépendances en cycle : ${cycle.join(' → ')}`);
  return errors;
}
