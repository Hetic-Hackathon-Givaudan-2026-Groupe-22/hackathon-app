# 0005. Simuler l'analyse dans l'API, derrière une interface remplaçable

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

Les stories P1 (fiche, analyse, débat, verdict) ont besoin de résultats d'analyse. Le service Data Sillage et son modèle d'IA (ADR 0003) ne sont pas prêts, et le MVP doit être présenté sans eux à la m2.

## Options

1. Simulateur dans l'API, derrière l'interface `AnalyseProvider` : écrans et base réels, remplacé par Sillage sans toucher au front. Un module de plus à maintenir.
2. Données en dur dans le front : le plus rapide. Rien n'est enregistré, tout est à refaire au branchement.
3. Faux serveur généré depuis `ia/openapi.yaml` : fidèle au contrat. Ne couvre pas le débat des agents, absent du contrat.

## Décision

Nous simulons l'analyse dans l'API derrière l'interface `AnalyseProvider`, parce que le front et la base fonctionnent déjà pour de vrai et que brancher Sillage ne changera qu'une classe.

## Conséquences

- Positives : chaque résultat simulé porte `mode: "dummy"`, affiché à l'écran.
- Négatives, à accepter : les débats simulés sont écrits à la main, pour 3 tendances.
- À revoir si : Sillage expose son modèle et le débat des agents dans son contrat.
