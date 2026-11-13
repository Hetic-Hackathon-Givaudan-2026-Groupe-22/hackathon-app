# 0016. Traduire l'interface avec next-intl

- Statut : acceptée, remplace [0013](0013-traduction-maison.md)
- Date : 2026-11-13
- Décideurs : Kuami (tech-lead)

## Contexte

US-07 demande l'interface en anglais, choix gardé à la reconnexion. L'ADR 0013 prévoyait un dictionnaire maison ; l'équipe préfère l'i18n de l'écosystème Next.js, avec des langues dans l'URL et des fichiers de traduction séparés du code.

## Options

1. next-intl : routes `/fr` et `/en` posées par le proxy de Next.js, `messages/fr.json` et `en.json`, `useTranslations` côté client et serveur, clés typées. Une dépendance, et toutes les pages sous `app/[locale]/`.
2. Guide officiel de Next.js (`app/[lang]/`, dictionnaires chargés côté serveur) : aucune dépendance. Traduction des composants clients et navigation localisée à écrire nous-mêmes.
3. Dictionnaire maison (ADR 0013) : déjà esquissé. Pas de langue dans l'URL, traductions mêlées au code.

## Décision

Nous traduisons avec next-intl, parce qu'il gère la langue dans l'URL, les composants clients et serveurs, et vérifie à la compilation qu'aucune clé ne manque.

## Conséquences

- Positives : les traductions vivent dans `web/messages/*.json` ; `Link`, `useRouter` et `usePathname` de `web/i18n/navigation.ts` gardent la langue.
- Négatives, à accepter : les contenus produits par l'analyse et le plan (débat, actions) restent en français.
- À revoir si : une troisième langue est demandée, ce qui demande seulement un fichier `messages` de plus.
