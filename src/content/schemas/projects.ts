import { z } from 'astro/zod';
import { sentenceCount } from '../../lib/projects.ts';
import { httpsUrl, repoRef, safeText } from './common.ts';

const MAX_SUMMARY = 200;
const MAX_DESCRIPTION = 160;
const MAX_TITLE = 43; // 60 caractères au total avec le suffixe « — Thibaut Monier »
const INSTALL_STEPS = 4;
const MAX_BRIEF_SENTENCES = 2;
const BUNDLE_REQUIRED = [
  'packagist',
  'license',
  'version',
  'inBrief',
  'readmeUrl',
  'installSteps',
] as const;

const installStepSchema = z.strictObject({ title: safeText.min(1), text: safeText.min(1) });

const contributionSchema = z.strictObject({
  number: z.number().int().positive(),
  type: z.enum(['pr', 'issue']),
  title: safeText.min(1),
  problem: safeText.min(1),
  fix: safeText.min(1),
  tests: safeText, // vide accepté ici : l'erreur métier est levée au niveau du projet (message de l'US)
  technical: safeText.optional(), // encadré repliable, exclu du budget de mots
  url: httpsUrl,
  mergedAt: z.coerce.date().optional(),
  status: z.enum(['merged', 'open', 'closed']),
});

/** Le champ `screenshot.src` est injecté (`image()` d'Astro en collection, `z.string()` en test). */
export function createProjectSchema(image: z.ZodType) {
  return z
    .strictObject({
      name: z.string().min(1),
      kind: z.enum(['bundle', 'contribution']),
      title: safeText.min(1).max(MAX_TITLE),
      description: safeText.min(50).max(MAX_DESCRIPTION),
      summary: safeText.max(MAX_SUMMARY),
      role: safeText.min(1),
      result: safeText.min(1).optional(),
      repo: repoRef,
      packagist: z.string().optional(),
      license: z.string().optional(),
      version: z.string().optional(), // version courante, lue à la rédaction (bundle)
      inBrief: safeText.optional(), // « En bref » non technique (bundle)
      readmeUrl: httpsUrl.optional(),
      demoUrl: httpsUrl.optional(), // seulement si une démo en ligne existe
      installSteps: z.array(installStepSchema).optional(),
      screenshot: z.strictObject({ src: image, alt: z.string().min(10) }).optional(),
      verifiedAt: z.coerce.date().optional(), // date de vérification des faits datés (étoiles, statuts)
      contributions: z.array(contributionSchema).default([]),
      draft: z.boolean().default(false),
    })
    .superRefine((project, ctx) => {
      if (project.kind === 'contribution' && project.contributions.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['contributions'],
          message: 'au moins une contribution',
        });
      }
      if (project.kind === 'contribution' && !project.result) {
        ctx.addIssue({
          code: 'custom',
          path: ['result'],
          message: 'result requis pour une étude de cas',
        });
      }
      if (project.kind === 'bundle') validateBundle(project, ctx);
      project.contributions.forEach((item, index) => {
        if (item.tests.trim() === '') {
          const subject = item.type === 'pr' ? 'la PR' : "l'issue";
          ctx.addIssue({
            code: 'custom',
            path: ['contributions', index, 'tests'],
            message: `Étude de cas « ${project.name} » : ${subject} #${item.number} n'a pas de tests de non-régression décrits`,
          });
        }
      });
    });
}

export type ProjectData = z.infer<ReturnType<typeof createProjectSchema>>;
export type Contribution = z.infer<typeof contributionSchema>;

function validateBundle(
  project: { installSteps?: unknown[] | undefined; inBrief?: string | undefined } & Record<
    string,
    unknown
  >,
  ctx: z.RefinementCtx,
): void {
  for (const field of BUNDLE_REQUIRED) {
    if (project[field] === undefined) {
      ctx.addIssue({ code: 'custom', path: [field], message: `${field} requis pour un bundle` });
    }
  }
  const steps = project.installSteps;
  if (steps && steps.length !== INSTALL_STEPS) {
    ctx.addIssue({
      code: 'custom',
      path: ['installSteps'],
      message: `installSteps : ${INSTALL_STEPS} étapes attendues, ${steps.length} fournies`,
    });
  }
  const sentences = project.inBrief ? sentenceCount(project.inBrief) : 0;
  if (sentences > MAX_BRIEF_SENTENCES) {
    ctx.addIssue({
      code: 'custom',
      path: ['inBrief'],
      message: `inBrief : ${MAX_BRIEF_SENTENCES} phrases au plus, ${sentences} fournies`,
    });
  }
}
