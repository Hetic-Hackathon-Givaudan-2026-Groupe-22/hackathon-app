# 0003. Confier l'IA au service Data Sillage, appelé selon openapi.yaml

- Statut : acceptée
- Date : 2026-11-10
- Décideurs : Kuami (tech-lead)

## Contexte

L'équipe Data code en Python le score des tendances (buzz ou durable) et le verdict. L'API NestJS doit l'afficher sans attendre que leurs modèles soient prêts : le service répond pour l'instant en mode `dummy`.

## Options

1. Service Data séparé, contrat `ia/openapi.yaml` : chaque équipe avance seule. Un service de plus à lancer.
2. Appeler un LLM depuis NestJS : un seul service. Le travail de la Data réécrit en TypeScript.
3. Notebooks partagés : aucun service. Aucun contrat, rien d'appelable par l'API.

## Décision

Nous confions l'IA au service Data Sillage, appelé par HTTP sur `POST /sillage/score` selon `ia/openapi.yaml`, parce que la Data garde Python et que l'API code dès aujourd'hui contre les réponses factices.

## Conséquences

- Positives : le passage du mode `dummy` à `reel` ne change pas le code de l'API.
- Négatives, à accepter : toute modification du contrat doit être validée par les deux équipes.
- À revoir si : le service Data n'est pas prêt pour la démo de la m2.
