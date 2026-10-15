import { absoluteUrl } from './site-url.ts';

// Format llmstxt.org : H1 (nom), citation de résumé, puis sections de liens `- [titre](url): description`.
export const MIN_LLMS_LINKS = 10;

export interface LlmsEntry {
  section: string;
  title: string;
  path: string;
  description: string;
}

export interface LlmsHeader {
  name: string;
  summary: string;
}

export function buildLlmsTxt(entries: LlmsEntry[], origin: string, header: LlmsHeader): string {
  if (entries.length < MIN_LLMS_LINKS) {
    throw new Error(
      `llms.txt : au moins ${MIN_LLMS_LINKS} liens attendus (${entries.length} fournis)`,
    );
  }
  const sections = new Map<string, LlmsEntry[]>();
  for (const entry of entries)
    sections.set(entry.section, [...(sections.get(entry.section) ?? []), entry]);

  const lines = [`# ${header.name}`, '', `> ${header.summary}`];
  for (const [section, items] of sections) {
    lines.push('', `## ${section}`, '');
    for (const item of items) {
      lines.push(`- [${item.title}](${absoluteUrl(item.path, origin)}): ${item.description}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
