# 0008. Valider les données reçues par l'API avec Zod

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

L'API reçoit des recherches, des lancements d'analyse et des verdicts saisis par Camille. Une modification de verdict doit refuser une justification vide (US-26). NestJS 12 accepte tout validateur au standard Standard Schema.

## Options

1. Zod, via `@Body({ schema })` de NestJS : un schéma déclaratif, type TypeScript déduit. Une dépendance de plus.
2. `class-validator` et `ValidationPipe` : la voie historique de NestJS. Une classe et des décorateurs par corps de requête.
3. Vérifications à la main : aucune dépendance. Oublis faciles, messages d'erreur disparates.

## Décision

Nous validons avec Zod, parce qu'un seul schéma donne à la fois la validation et le type, sans classe à écrire, et qu'il réutilise les types du schéma Drizzle (ADR 0006).

## Conséquences

- Positives : une entrée invalide est refusée en 400 avec la liste des champs en défaut.
- Négatives, à accepter : les schémas Zod ne génèrent pas encore le Swagger de l'API.
- À revoir si : le Swagger de l'API (#10) doit décrire chaque corps de requête.
