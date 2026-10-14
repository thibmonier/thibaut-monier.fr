// Assemblage des données du CV PDF (US-007, ADR-0005) : fonction pure qui produit l'objet JSON lu par Typst
// (`json()`). Liste blanche stricte : seules les clés construites ici atteignent le PDF.
import type { Experience } from '../content/schemas/experiences.ts';
import type { Profile } from '../content/schemas/profile.ts';
import type { Tokens } from '../content/schemas/tokens.ts';
import { formatPeriod, splitFeatured } from './experiences.ts';

export const EARLIER_LABEL = 'Avant 2016'; // identique au bloc repliable de /parcours/
const LOCATION = 'Nantes (France)';
const FONT = 'Inter';
const THEME_COLORS = ['fg', 'muted', 'accent', 'border', 'surface'] as const;
const LINK_LABELS: Record<Profile['links'][number]['kind'], string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  packagist: 'Packagist',
  rss: 'Flux RSS',
};

export type CvExperienceInput = Experience & { id: string };

export interface CvData {
  meta: { title: string; author: string; lang: 'fr'; generatedAt: string };
  header: {
    name: string;
    title: string;
    tagline: string;
    location: string;
    links: { label: string; url: string }[];
  };
  summary: string;
  experiences: {
    company: string;
    role: string;
    period: string;
    location: string | null;
    context: string;
    achievements: string[];
  }[];
  earlier: { company: string; role: string; period: string; summary: string }[];
  labels: { summary: string; experiences: string; earlier: string };
  theme: { font: string; colors: Record<(typeof THEME_COLORS)[number], string> };
}

export interface CvInput {
  profile: Profile;
  experiences: readonly CvExperienceInput[];
  tokens: Tokens;
  generatedAt: Date;
}

function themeColors(tokens: Tokens): CvData['theme']['colors'] {
  const entries = THEME_COLORS.map((name) => {
    const token = tokens.color[name];
    if (!token) throw new Error(`Jeton de couleur « ${name} » absent de src/data/tokens.json`);
    return [name, token.light] as const;
  });
  return Object.fromEntries(entries) as CvData['theme']['colors'];
}

export function buildCvData({ profile, experiences, tokens, generatedAt }: CvInput): CvData {
  const { featured, earlier } = splitFeatured(experiences);
  return {
    meta: {
      title: `${profile.name} – CV`,
      author: profile.name,
      lang: 'fr',
      generatedAt: generatedAt.toISOString().slice(0, 10),
    },
    header: {
      name: profile.name,
      title: profile.title,
      tagline: profile.tagline,
      location: LOCATION,
      links: profile.links.map(({ kind, url }) => ({ label: LINK_LABELS[kind], url })),
    },
    summary: profile.summary,
    experiences: featured.map((item) => ({
      company: item.company,
      role: item.role,
      period: formatPeriod(item.start, item.end),
      location: item.location ?? null,
      context: item.context,
      achievements: [...item.achievements],
    })),
    earlier: earlier.map((item) => {
      if (!item.summaryOnly)
        throw new Error(`${item.id} : summaryOnly requis hors frise détaillée`);
      return {
        company: item.company,
        role: item.role,
        period: formatPeriod(item.start, item.end),
        summary: item.summaryOnly,
      };
    }),
    labels: { summary: 'Profil', experiences: 'Expériences', earlier: EARLIER_LABEL },
    theme: { font: FONT, colors: themeColors(tokens) },
  };
}
