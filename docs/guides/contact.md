# Page de contact

Formulaire en amélioration progressive (ADR-0004, arbitrage A3 du sprint 1).

- **Sans JavaScript** : `<form method="POST" action="https://api.web3forms.com/submit">` avec les champs cachés `access_key`, `redirect` (vers `/contact/merci/`) et `botcheck`. La CSP autorise `form-action` et `connect-src` vers `api.web3forms.com`.
- **Avec JavaScript** (`src/components/contact/contact-form.ts`) : validation en ligne (messages sous les champs, focus sur le premier en erreur), délai anti-spam de 3 s et champ piège (faux succès sans requête), envoi `fetch` JSON, repli en cas d'erreur, événement Umami `contact_submit{motif}` si Umami est chargé.
- La logique pure est dans `src/lib/contact.ts` (testée), la configuration dans `src/config/contact.ts`.

## Variables de build

| Variable | Rôle | Si absente |
|----------|------|------------|
| `PUBLIC_WEB3FORMS_KEY` | Clé publique Web3Forms | Message de repli accessible à la place du formulaire |
| `PUBLIC_CALENDLY_URL` | Lien du type d'événement Calendly (https) | Bouton « Réserver un créneau de 30 min » masqué |

Le champ `fallbackEmail` de `src/config/contact.ts` est vide : tant qu'il n'est pas renseigné, le message de repli renvoie vers LinkedIn.

## Tester en local

```bash
PUBLIC_WEB3FORMS_KEY=cle-factice PUBLIC_CALENDLY_URL=https://calendly.com/exemple/echange make e2e
```

Les appels à Web3Forms sont simulés dans Playwright (`page.route`) : aucune requête réelle. Un envoi réel unique avec la vraie clé reste à faire depuis `make preview` (T-008-09). Clé révoquée : en régénérer une dans Web3Forms, mettre à jour la variable Railway et GitHub, redéployer.
