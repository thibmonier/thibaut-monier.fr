import { describe, expect, it } from 'vitest';
import { composerRequire, installPackage } from '../../../src/lib/install.ts';

describe('install', () => {
  it('génère la commande composer require', () => {
    expect(composerRequire('tmonier/sylius-order-hold-plugin')).toBe(
      'composer require tmonier/sylius-order-hold-plugin',
    );
  });

  it('retombe sur le vendor tmonier quand le paquet n’est pas publié', () => {
    expect(installPackage({ repo: { name: 'sylius-agentic-feeds-plugin' } })).toEqual({
      name: 'tmonier/sylius-agentic-feeds-plugin',
      published: false,
    });
    expect(installPackage({ packagist: 'tmonier/x', repo: { name: 'sylius-x-plugin' } })).toEqual({
      name: 'tmonier/x',
      published: true,
    });
  });
});
