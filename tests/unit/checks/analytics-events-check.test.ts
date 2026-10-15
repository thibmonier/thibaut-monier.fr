import { describe, expect, it } from 'vitest';
import { findEventViolations } from '../../../scripts/checks/lib/analytics-events.ts';

const run = (content: string, file = 'src/components/x.astro') =>
  findEventViolations([{ path: file, content }]);

describe('findEventViolations', () => {
  it('accepte un data-event valide et un appel valide', () => {
    expect(run('<a data-event="cv_download" href="/x">CV</a>')).toEqual([]);
    expect(run("trackEvent('contact_submit', { motif: values.motif });", 'src/a.ts')).toEqual([]);
    expect(run("window.umami?.track('rdv_click');", 'src/a.ts')).toEqual([]);
  });

  it('signale un nom hors liste dans data-event, data-umami-event et track()', () => {
    expect(run('<a data-event="page_vue">')).toEqual([
      'Événement page_vue : nom inconnu (src/components/x.astro:1)',
    ]);
    expect(run('<a data-umami-event="inconnu">')).toEqual([
      'Événement inconnu : nom inconnu (src/components/x.astro:1)',
    ]);
    expect(run("track('autre_chose')", 'src/a.ts')).toEqual([
      'Événement autre_chose : nom inconnu (src/a.ts:1)',
    ]);
  });

  it('signale une propriété hors liste, par exemple email', () => {
    expect(run("track('contact_submit', { motif: 'poste', email: x })", 'src/a.ts')).toEqual([
      "Événement contact_submit : propriété interdite 'email' (src/a.ts:1)",
    ]);
    expect(run('<a data-event="rdv_click" data-umami-event-email="x">')).toEqual([
      "Événement rdv_click : propriété interdite 'email' (src/components/x.astro:1)",
    ]);
  });

  it('cite la ligne fautive et s’applique aussi au Markdown', () => {
    expect(
      run('# Titre\n\n<a data-event="oups" href="/">x</a>', 'src/content/blog/fr/a.md'),
    ).toEqual(['Événement oups : nom inconnu (src/content/blog/fr/a.md:3)']);
  });

  it('ignore les appels dont le nom n’est pas un littéral', () => {
    expect(run('window.umami?.track(name, props);', 'src/scripts/analytics.ts')).toEqual([]);
  });
});
