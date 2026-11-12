# 0009. Construire l'interface avec daisyUI sur Tailwind CSS

- Statut : remplacée par [0011](0011-design-prototype-sillage.md)
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

Les P1 comptent une dizaine d'écrans (liste, fiche, débat, verdict) à livrer pour la m2, sans designer dans l'équipe Tech. Tailwind CSS est déjà installé par `create-next-app`.

## Options

1. daisyUI, plugin Tailwind : composants prêts (carte, badge, onglets, chronomètre), thèmes clair et sombre. Un style reconnaissable.
2. shadcn/ui : composants copiés dans le dépôt, très personnalisables. Beaucoup de fichiers à maintenir.
3. Tailwind seul : aucune dépendance. Chaque composant à dessiner.

## Décision

Nous choisissons daisyUI, parce qu'il ajoute des composants par simples classes CSS sur le Tailwind déjà en place, sans code JavaScript ni fichier à copier.

## Conséquences

- Positives : un thème unique règle les couleurs de tous les écrans.
- Négatives, à accepter : l'écart avec les maquettes Figma est corrigé thème par thème, pas pixel par pixel.
- À revoir si : le Product exige une fidélité exacte aux maquettes.
