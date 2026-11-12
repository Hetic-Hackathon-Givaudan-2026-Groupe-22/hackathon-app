# 0014. Dessiner le globe des tendances en Canvas 2D, repris du prototype

- Statut : acceptée
- Date : 2026-11-13
- Décideurs : Kuami (tech-lead)

## Contexte

US-08 demande un globe qui tourne à la souris et au doigt, avec une infobulle par tendance ; US-11 veut que filtres et globe montrent les mêmes résultats. Le prototype dessine déjà ce globe en Canvas 2D.

## Options

1. Canvas 2D repris du prototype : aucune dépendance, rendu déjà validé. Projection et interactions écrites à la main.
2. `globe.gl` (Three.js) : relief et effets 3D. Plusieurs centaines de Ko de JavaScript en plus.
3. Carte plate (SVG) : simple et accessible. Ne répond pas à « faire tourner le globe ».

## Décision

Nous reprenons le globe Canvas 2D du prototype, parce qu'il a déjà le rendu voulu et ne coûte aucune dépendance.

## Conséquences

- Positives : chaque tendance garde la couleur de sa famille ; la liste (US-09) reste l'accès clavier et lecteur d'écran.
- Négatives, à accepter : pays de départ et d'arrivée stockés pour chaque tendance, dans des coordonnées simplifiées.
- À revoir si : le globe ralentit sur les téléphones de l'équipe.
