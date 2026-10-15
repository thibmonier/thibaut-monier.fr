import { getCollection, getEntry } from 'astro:content';
import { site } from '../config/site.ts';
import { getPublishedPosts } from './blog-source.ts';
import { postPath, slugOf } from './blog.ts';
import type { LlmsEntry, LlmsHeader } from './llms.ts';
import { buildOgPages, type OgPage } from './og.ts';

// Chargeur commun des pages du site pour llms.txt et les images Open Graph : une seule lecture des collections
// (articles par `getPublishedPosts`, plugins, projets), mémorisée le temps du build. Le sitemap n'en a pas besoin :
// `@astrojs/sitemap` découvre les pages construites.

const slugOfEntry = (id: string): string => id.replace(/^fr\//, '');

async function loadSources() {
  const [posts, plugins, projects, profile] = await Promise.all([
    getPublishedPosts(),
    getCollection('plugins', ({ data }) => !data.draft),
    getCollection('projects', ({ data }) => !data.draft),
    getEntry('profile', 'fr'),
  ]);
  if (!profile) throw new Error("Entrée 'fr' introuvable dans la collection profile");
  return { posts, plugins, projects, profile: profile.data };
}

type Sources = Awaited<ReturnType<typeof loadSources>>;
let cache: Promise<Sources> | undefined;
const sources = (): Promise<Sources> => (cache ??= loadSources());

let ogCache: Promise<Record<string, OgPage>> | undefined;

/** Registre des images Open Graph : une entrée par article, fiche plugin et projet, plus l'image `default`. */
export function loadOgPages(): Promise<Record<string, OgPage>> {
  ogCache ??= sources().then(({ posts, plugins, projects, profile }) =>
    buildOgPages({
      fallback: { title: site.name, description: profile.title },
      articles: posts.map((post) => ({
        slug: slugOf(post.id),
        title: post.data.title,
        description: post.data.description,
      })),
      plugins: plugins.map((p) => ({
        slug: slugOfEntry(p.id),
        name: p.data.name,
        tagline: p.data.tagline,
      })),
      projects: projects.map((p) => ({
        slug: slugOfEntry(p.id),
        title: p.data.title,
        summary: p.data.summary,
      })),
    }),
  );
  return ogCache;
}

const MAIN_PAGES: LlmsEntry[] = [
  {
    section: 'Profil',
    title: 'Accueil',
    path: '/',
    description: 'Présentation, offres et preuves de résultats.',
  },
  {
    section: 'Profil',
    title: 'Parcours professionnel',
    path: '/parcours/',
    description:
      'Rôles, périodes, contextes et réalisations, de développeur à directeur technique.',
  },
  {
    section: 'Profil',
    title: 'Compétences',
    path: '/competences/',
    description: 'Compétences techniques et de management, avec leurs preuves.',
  },
  {
    section: 'Profil',
    title: 'Contact',
    path: '/contact/',
    description: 'Formulaire de contact pour une mission ou un poste.',
  },
  {
    section: 'Open source',
    title: 'Plugins Sylius 2 open source',
    path: '/open-source/',
    description:
      'Catalogue des plugins Sylius 2 : B2B, conformité UE, back-office, IA et intégrations.',
  },
];

export async function loadLlms(): Promise<{ header: LlmsHeader; entries: LlmsEntry[] }> {
  const { posts, plugins, projects, profile } = await sources();
  const entries: LlmsEntry[] = [
    ...MAIN_PAGES,
    ...projects.map((p) => ({
      section: 'Open source',
      title: p.data.title,
      path: `/open-source/${slugOfEntry(p.id)}/`,
      description: p.data.summary,
    })),
    ...plugins.map((p) => ({
      section: 'Plugins Sylius',
      title: p.data.name,
      path: `/open-source/sylius/${slugOfEntry(p.id)}/`,
      description: p.data.tagline,
    })),
    ...posts.map((post) => ({
      section: 'Articles',
      title: post.data.title,
      path: postPath(slugOf(post.id)),
      description: post.data.description,
    })),
  ];
  return { header: { name: site.name, summary: `${profile.title}. ${profile.tagline}` }, entries };
}
