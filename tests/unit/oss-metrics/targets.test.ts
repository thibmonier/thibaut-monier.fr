import { describe, expect, it } from 'vitest';
import { OSS_TARGETS, metricsKey, slugFromRepo } from '../../../scripts/lib/oss-targets.ts';

describe('OSS_TARGETS', () => {
  it('compte 21 cibles : 20 plugins Sylius 2 et tailsfadmin', () => {
    expect(OSS_TARGETS).toHaveLength(21);
    expect(OSS_TARGETS.filter((t) => t.repo.includes('sylius-'))).toHaveLength(20);
  });

  it('a des dépôts et des slugs uniques', () => {
    expect(new Set(OSS_TARGETS.map((t) => t.repo)).size).toBe(21);
    expect(new Set(OSS_TARGETS.map((t) => t.slug)).size).toBe(21);
  });

  it('exclut Punchout cXML (E4)', () => {
    expect(OSS_TARGETS.some((t) => t.repo.includes('punchout'))).toBe(false);
  });

  it('ne déclare aucun paquet Packagist pour agentic-feeds (non publié, E20)', () => {
    const feeds = OSS_TARGETS.find((t) => t.slug === 'agentic-feeds');
    expect(feeds).toBeDefined();
    expect(feeds?.packagist).toBeUndefined();
  });

  it('associe tailsfadmin à son paquet Packagist propre', () => {
    expect(OSS_TARGETS.find((t) => t.slug === 'tailsfadmin')).toMatchObject({
      repo: 'thibmonier/tailsfadmin',
      packagist: 'tailsfadmin/tailsfadmin-bundle',
    });
  });

  it('dérive vendor et dépôt des plugins : tmonier/<dépôt>', () => {
    for (const target of OSS_TARGETS.filter((t) => t.repo.includes('sylius-') && t.packagist)) {
      expect(target.packagist).toBe(`tmonier/${target.repo.split('/')[1]}`);
    }
  });
});

describe('slugFromRepo', () => {
  it('retire « sylius- » et « -plugin » (E5)', () => {
    expect(slugFromRepo('thibmonier/sylius-company-accounts-plugin')).toBe('company-accounts');
    expect(slugFromRepo('thibmonier/sylius-b2b-mcp-plugin')).toBe('b2b-mcp');
    expect(slugFromRepo('thibmonier/tailsfadmin')).toBe('tailsfadmin');
  });
});

describe('metricsKey', () => {
  it('renvoie la clé owner/repo du JSON', () => {
    expect(metricsKey({ repo: 'thibmonier/x' })).toBe('thibmonier/x');
  });
});
