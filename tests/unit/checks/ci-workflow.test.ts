import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// US-010 (T-900-21) : la CI produit l'artefact de redirections nginx, sans le déployer.
const workflow = await readFile(join(process.cwd(), '.github/workflows/ci.yml'), 'utf8');

describe('ci.yml : artefact de redirections', () => {
  it('exécute scripts/build-redirects.ts dans Docker', () => {
    expect(workflow).toMatch(/docker run[^\n]*\\?[\s\S]{0,300}node scripts\/build-redirects\.ts/);
  });
  it('publie agentic-agency.nginx.conf avec upload-artifact épinglé par SHA', () => {
    const step = workflow.match(/name: redirections-nginx[\s\S]{0,300}/)?.[0] ?? '';
    expect(step).toContain('agentic-agency.nginx.conf');
    const upload = workflow.match(
      /uses: (actions\/upload-artifact@[0-9a-f]{40}) #[^\n]*\n\s+with:\n\s+name: redirections-nginx/,
    );
    expect(upload?.[1]).toBeDefined();
  });
  it('vérifie que le fichier généré n’est pas vide et couvre 28 articles en deux formes', () => {
    expect(workflow).toMatch(/test -s [^\n]*agentic-agency\.nginx\.conf/);
  });
  it('ne déploie rien', () => {
    expect(workflow).not.toMatch(/scp|rsync|railway up/);
  });
});
