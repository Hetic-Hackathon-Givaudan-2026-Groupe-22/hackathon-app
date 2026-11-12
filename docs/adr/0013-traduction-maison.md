# 0013. Traduire l'interface avec un dictionnaire maison

- Statut : acceptée
- Date : 2026-11-13
- Décideurs : Kuami (tech-lead)

## Contexte

US-07 demande l'interface en anglais, choix gardé à la reconnexion. Deux langues, une centaine de libellés, écrans rendus côté navigateur. Les contenus produits par l'analyse restent en français.

## Options

1. Dictionnaire maison (`web/lib/i18n.ts`) et contexte React, langue enregistrée dans le compte : aucune dépendance, libellés typés. Pluriels et formats écrits à la main.
2. `next-intl` : la référence pour Next.js. Routes par langue et configuration du middleware.
3. `i18next` : très complet. Lourd pour deux langues.

## Décision

Nous traduisons avec un dictionnaire maison typé, parce que deux langues et une centaine de libellés ne justifient pas une bibliothèque, et qu'une clé manquante est une erreur de compilation.

## Conséquences

- Positives : le choix FR / EN suit le compte d'un appareil à l'autre.
- Négatives, à accepter : les textes du débat et du verdict, produits par l'analyse, restent en français.
- À revoir si : une troisième langue est demandée.
