import { describe, expect, it } from 'vitest';
import { OSS_TARGETS, metricsKey, slugFromRepo } from '../../../scripts/lib/oss-targets.ts';

describe('OSS_TARGETS', () => {
  it('compte 25 cibles : 24 plugins Sylius 2 et tailsfadmin', () => {
    expect(OSS_TARGETS).toHaveLength(25);
    expect(OSS_TARGETS.filter((t) => t.repo.includes('sylius-'))).toHaveLength(24);
  });

  it('a des dépôts et des slugs uniques', () => {
    expect(new Set(OSS_TARGETS.map((t) => t.repo)).size).toBe(25);
    expect(new Set(OSS_TARGETS.map((t) => t.slug)).size).toBe(25);
  });

  it('inclut les quatre plugins ajoutés le 2026-10-20, dont Punchout cXML publié depuis', () => {
    const slugs = OSS_TARGETS.map((t) => t.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        'channel-access',
        'registration-approval',
        'punchout-cxml',
        'customer-asset-management',
      ]),
    );
    expect(OSS_TARGETS.find((t) => t.slug === 'punchout-cxml')?.packagist).toBe(
      'tmonier/sylius-punchout-cxml-plugin',
    );
  });

  it('ne déclare aucun paquet pour customer-asset-management (en conception, sans version)', () => {
    const target = OSS_TARGETS.find((t) => t.slug === 'customer-asset-management');
    expect(target?.repo).toBe('thibmonier/sylius-customer-asset-management-plugin');
    expect(target?.packagist).toBeUndefined();
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
