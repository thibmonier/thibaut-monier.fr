// Dépôts dont on relève les métriques (ADR-0006) : les 20 plugins Sylius 2 du catalogue (Punchout cXML
// exclu, E4) et le bundle tailsfadmin. Organisation GitHub `thibmonier`, vendor Packagist `tmonier` (E5).
// `sylius-agentic-feeds-plugin` n'est pas publié sur Packagist (E20, vérifié le 2026-10-14) : pas de paquet.
export interface Target {
  slug: string;
  repo: string; // owner/name
  packagist?: string; // vendor/paquet
}

const OWNER = 'thibmonier';
const VENDOR = 'tmonier';

export function slugFromRepo(repo: string): string {
  const name = repo.split('/')[1] ?? repo;
  return name.replace(/^sylius-/, '').replace(/-plugin$/, '');
}

export const metricsKey = (target: Pick<Target, 'repo'>): string => target.repo;

const plugin = (name: string, published = true): Target => ({
  slug: slugFromRepo(name),
  repo: `${OWNER}/${name}`,
  ...(published ? { packagist: `${VENDOR}/${name}` } : {}),
});

export const OSS_TARGETS: readonly Target[] = [
  plugin('sylius-admin-order-creation-plugin'),
  plugin('sylius-agentic-feeds-plugin', false),
  plugin('sylius-ai-catalog-copilot-plugin'),
  plugin('sylius-audit-log-plugin'),
  plugin('sylius-b2b-mcp-plugin'),
  plugin('sylius-bulk-actions-plugin'),
  plugin('sylius-command-palette-plugin'),
  plugin('sylius-company-accounts-plugin'),
  plugin('sylius-container-fill-plugin'),
  plugin('sylius-facturx-plugin'),
  plugin('sylius-gpsr-plugin'),
  plugin('sylius-order-hold-plugin'),
  plugin('sylius-purchase-approval-plugin'),
  plugin('sylius-quick-order-plugin'),
  plugin('sylius-quote-request-plugin'),
  plugin('sylius-tier-pricing-plugin'),
  plugin('sylius-timeline-plugin'),
  plugin('sylius-trade-credit-plugin'),
  plugin('sylius-webhook-outbox-plugin'),
  plugin('sylius-withdrawal-plugin'),
  {
    slug: 'tailsfadmin',
    repo: `${OWNER}/tailsfadmin`,
    packagist: 'tailsfadmin/tailsfadmin-bundle',
  },
];
