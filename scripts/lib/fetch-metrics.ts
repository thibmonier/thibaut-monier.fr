import type { OssMetric, OssMetrics } from '../../src/content/schemas/oss-metrics.ts';
import type { Target } from './oss-targets.ts';

type Github = NonNullable<OssMetric['github']>;
type Packagist = NonNullable<OssMetric['packagist']>;
type Release = Github['latestRelease'];

export interface CollectDeps {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  now: () => Date;
  sleep: (ms: number) => Promise<unknown>;
  log: { info: (message: string) => void; warn: (message: string) => void };
  token?: string;
}

export type { Target };

const TIMEOUT_MS = 10_000;
const RETRIES = 2;
const BACKOFF_MS = 1000;
const GITHUB_API = 'https://api.github.com/repos';
const PACKAGIST = 'https://packagist.org/packages';
const STABLE_VERSION = /^v?\d+(?:\.\d+)*$/;

type Reply<T> = { ok: true; value: T } | { ok: false; reason: string };

const asNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined;
const asDate = (value: unknown): Date | undefined => {
  const date = typeof value === 'string' ? new Date(value) : undefined;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
};
const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

class Collector {
  private githubBlocked = false;
  private readonly deps: CollectDeps;

  constructor(deps: CollectDeps) {
    this.deps = deps;
  }

  private warn(message: string): void {
    this.deps.log.warn(this.redact(message));
  }

  private redact(text: string): string {
    const { token } = this.deps;
    return token ? text.split(token).join('***') : text;
  }

  /** GET JSON avec délai de 10 s et 2 reprises (erreurs réseau, 5xx) ; 4xx jamais repris. */
  private async getJson(
    url: string,
    github: boolean,
  ): Promise<Reply<unknown> & { status?: number }> {
    const headers: Record<string, string> = {
      accept: github ? 'application/vnd.github+json' : 'application/json',
      'user-agent': 'thibaut-monier-site-metrics',
    };
    if (github && this.deps.token) headers.authorization = `Bearer ${this.deps.token}`;
    let reason = 'inconnue';
    for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
      if (attempt > 0) await this.deps.sleep(BACKOFF_MS * attempt);
      try {
        const response = await this.deps.fetch(url, {
          headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (response.status >= 500) {
          reason = `HTTP ${response.status}`;
          continue;
        }
        if (!response.ok)
          return { ok: false, reason: `HTTP ${response.status}`, status: response.status };
        return { ok: true, value: await response.json() };
      } catch (error) {
        reason = error instanceof Error ? this.redact(error.message) : 'erreur réseau';
      }
    }
    return { ok: false, reason };
  }

  private async github(
    repo: string,
    slug: string,
  ): Promise<{ stars?: number; pushedAt?: Date; release?: Release }> {
    if (this.githubBlocked) return {};
    const repoReply = await this.getJson(`${GITHUB_API}/${repo}`, true);
    if (!repoReply.ok) {
      if (repoReply.status === 403) {
        this.githubBlocked = true;
        this.warn(
          `GitHub a répondu 403 (limite de débit) : plus aucune requête GitHub, valeurs précédentes conservées`,
        );
      } else {
        this.warn(`GitHub indisponible pour « ${slug} » (${repoReply.reason})`);
      }
      return {};
    }
    const body = record(repoReply.value);
    const stars = asNumber(body.stargazers_count);
    const pushedAt = asDate(body.pushed_at);
    const release = await this.release(repo, slug);
    return {
      ...(stars !== undefined ? { stars } : {}),
      ...(pushedAt ? { pushedAt } : {}),
      ...(release !== undefined ? { release } : {}),
    };
  }

  private async release(repo: string, slug: string): Promise<Release | undefined> {
    const reply = await this.getJson(`${GITHUB_API}/${repo}/releases/latest`, true);
    if (!reply.ok) {
      if (reply.status === 404) return null; // aucune release : état normal, pas un échec
      if (reply.status === 403) this.githubBlocked = true;
      this.warn(`Release GitHub indisponible pour « ${slug} » (${reply.reason})`);
      return undefined;
    }
    const body = record(reply.value);
    const publishedAt = asDate(body.published_at);
    return typeof body.tag_name === 'string' && publishedAt
      ? { tag: body.tag_name, publishedAt }
      : undefined;
  }

  private async packagist(name: string, slug: string): Promise<Packagist | undefined> {
    const reply = await this.getJson(`${PACKAGIST}/${name}.json`, false);
    if (!reply.ok) {
      this.warn(`Packagist indisponible pour « ${slug} » (${reply.reason})`);
      return undefined;
    }
    const pkg = record(record(reply.value).package);
    const downloads = record(pkg.downloads);
    const total = asNumber(downloads.total);
    const monthly = asNumber(downloads.monthly);
    const latest = Object.keys(record(pkg.versions)).find((version) =>
      STABLE_VERSION.test(version),
    );
    if (total === undefined || monthly === undefined || !latest) {
      this.warn(
        `Réponse Packagist sans champ « downloads » exploitable pour « ${slug} » : téléchargements omis`,
      );
      return undefined;
    }
    return { downloadsTotal: total, downloadsMonthly: monthly, latestVersion: latest };
  }

  async entry(target: Target, previous: OssMetric | undefined): Promise<OssMetric | undefined> {
    const now = this.deps.now();
    const fresh = await this.github(target.repo, target.slug);
    const freshPackagist = target.packagist
      ? await this.packagist(target.packagist, target.slug)
      : undefined;

    let github: Github | undefined;
    let usedPrevious = false;
    if (fresh.stars !== undefined && fresh.pushedAt) {
      let latestRelease = fresh.release;
      if (latestRelease === undefined) {
        latestRelease = previous?.github?.latestRelease ?? null;
        if (previous?.github) usedPrevious = true;
        else this.warn(`Métrique « release » indisponible pour « ${target.slug} » : bloc masqué`);
      }
      github = { stars: fresh.stars, pushedAt: fresh.pushedAt, latestRelease };
    } else if (previous?.github) {
      github = previous.github;
      usedPrevious = true;
    } else {
      this.warn(`Métrique « stars » indisponible pour « ${target.slug} » : bloc masqué`);
    }

    let packagist = freshPackagist;
    if (target.packagist && !packagist) {
      if (previous?.packagist) {
        packagist = previous.packagist;
        usedPrevious = true;
      } else {
        this.warn(`Métrique « downloads » indisponible pour « ${target.slug} » : bloc masqué`);
      }
    }
    if (!github && !packagist) return undefined;
    return {
      fetchedAt: usedPrevious && previous ? previous.fetchedAt : now,
      ...(github ? { github } : {}),
      ...(packagist ? { packagist } : {}),
    };
  }
}

/**
 * Relève GitHub et Packagist pour chaque cible. Ne lève jamais : une métrique inconnue est remplacée
 * par la valeur précédente (avec sa date, jamais rajeunie), sinon omise. Aucun jeton dans les journaux.
 */
export async function collectMetrics(
  targets: readonly Target[],
  previous: OssMetrics | undefined,
  deps: CollectDeps,
): Promise<OssMetrics> {
  const collector = new Collector(deps);
  const entries: OssMetrics['entries'] = {};
  for (const target of [...targets].sort((x, y) => x.repo.localeCompare(y.repo))) {
    const entry = await collector.entry(target, previous?.entries[target.repo]);
    if (entry) entries[target.repo] = entry;
  }
  return { generatedAt: deps.now(), entries };
}
