---
name: tailsfadmin
kind: bundle
title: 'tailsfadmin, thème admin Symfony'
description: 'tailsfadmin : bundle Symfony open source, un thème d’administration Tailwind v4 prêt à brancher, installé en 4 étapes.'
summary: 'Bundle Symfony open source : un thème d’administration basé sur TailAdmin (Symfony UX, Stimulus, AssetMapper, Tailwind CSS v4).'
role: 'Auteur et mainteneur du bundle, publié sur Packagist.'
repo:
  owner: thibmonier
  name: tailsfadmin
packagist: tailsfadmin/tailsfadmin-bundle
license: MIT
version: v1.6.2
verifiedAt: 2026-10-14
readmeUrl: https://github.com/thibmonier/tailsfadmin#readme
inBrief: 'tailsfadmin est un thème d’administration prêt à l’emploi pour les applications Symfony : tableaux de bord, graphiques, tableaux, formulaires et calendrier dans un style cohérent. Il évite à une équipe de redessiner ces mêmes écrans d’un projet à l’autre.'
installSteps:
  - title: 'Installer le paquet'
    text: 'Une commande Composer ; Symfony Flex active le bundle automatiquement.'
  - title: 'Brancher les assets'
    text: 'Déclarer le chemin AssetMapper des contrôleurs, puis lancer la commande du bundle qui installe les bibliothèques tierces en local, sans CDN.'
  - title: 'Brancher le thème CSS'
    text: 'Une seule ligne d’import dans l’entrée Tailwind v4 de l’application, sans recopier les jetons de design.'
  - title: 'Configurer le menu et la page'
    text: 'Décrire le menu de la barre latérale en YAML, puis faire hériter la page du layout d’administration du bundle.'
---

## Ce que le bundle apporte

- **Des composants prêts à l’emploi.** Des composants Twig préfixés `tsf:`, comme `tsf:Ui:Button`, `tsf:Ui:StatCard` (carte d’indicateur) ou `tsf:Layout:PageHeader`, documentés avec leurs propriétés et des exemples.
- **Un thème Tailwind CSS v4.** Mode sombre par classe et changement de couleur de marque en redéfinissant quelques variables, sans toucher au bundle.
- **Un menu piloté par la configuration.** La barre latérale se décrit en YAML et peut masquer des entrées selon les droits de l’utilisateur.
- **Plusieurs langues.** Interface en français et en anglais, avec prise en charge des langues qui s’écrivent de droite à gauche.

## Une architecture documentée

Le dépôt sépare nettement le bundle (le produit distribué) de l’application de démonstration (son usage), avec une règle écrite : aucun code réutilisable ne vit dans la démo. Les choix structurants sont consignés dans sept décisions d’architecture (ADR) versionnées avec le code, que je ne recopie pas ici : elles se lisent dans le dépôt.

## Qualité

L’analyse statique PHPStan est au niveau maximum, le style est contrôlé par PHP CS Fixer, et les tests couvrent le bundle (PHPUnit), la démonstration (tests fonctionnels) et le rendu dans un vrai navigateur, avec un audit d’accessibilité automatisé. Chaque évolution est consignée dans le journal des modifications du dépôt, selon le versionnement sémantique.
