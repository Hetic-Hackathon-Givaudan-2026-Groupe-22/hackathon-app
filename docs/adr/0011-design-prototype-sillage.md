# 0011. Adopter le design du prototype Sillage à la place de daisyUI

- Statut : acceptée, remplace [0009](0009-interface-daisyui.md)
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

L'interface daisyUI de la m2 est jugée peu élégante. Un prototype HTML de Sillage existe déjà : palette pastel des familles d'arômes, police Figtree, tour de table des agents. Ses classes (`.btn`, `.card`, `.steps`, `.table`) entrent en conflit avec celles de daisyUI.

## Options

1. Reprendre la feuille de style du prototype (`web/app/sillage.css`) et retirer daisyUI : le design validé tel quel, une seule source de style. Du CSS maison à maintenir.
2. Garder daisyUI et l'habiller avec un thème proche : composants existants conservés. Le tour de table et les cartes du prototype restent à refaire.
3. Réécrire le prototype en classes Tailwind : tout dans un seul outil. Plusieurs jours de conversion.

## Décision

Nous reprenons la feuille de style du prototype et retirons daisyUI, parce que le design est déjà validé et qu'il s'applique aux composants existants sans changer leur logique.

## Conséquences

- Positives : l'app et le prototype ont la même apparence ; Tailwind reste disponible pour les utilitaires.
- Négatives, à accepter : `sillage.css` contient aussi des règles d'écrans P2 pas encore construits.
- À revoir si : les règles inutilisées gênent la maintenance une fois les écrans P2 faits ou abandonnés.
