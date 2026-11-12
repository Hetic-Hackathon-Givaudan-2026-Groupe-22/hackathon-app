# 0006. Gérer le schéma de PostgreSQL avec Drizzle et ses migrations

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

Les P1 ajoutent au moins cinq tables (tendances, analyses, messages, sources, verdicts). `db/init/` n'est joué qu'au premier démarrage (ADR 0002) : chaque changement de schéma oblige toute l'équipe à vider `db/data/`.

## Options

1. Drizzle ORM et `drizzle-kit` : schéma en TypeScript, migrations SQL versionnées, requêtes typées. Une dépendance de plus à apprendre.
2. SQL brut et `node-pg-migrate` : aucune abstraction. Requêtes et types écrits deux fois.
3. Prisma : très outillé. Client généré et moteur lourds à faire tourner dans le conteneur.

## Décision

Nous choisissons Drizzle avec ses migrations, parce que le schéma et les types TypeScript ne font qu'un et qu'un `npm run db:migrate` remplace la remise à zéro de `db/data/`.

## Conséquences

- Positives : les migrations sont relues en pull request ; les données de démonstration passent par `npm run db:seed`.
- Négatives, à accepter : `db/init/` ne sert plus qu'à créer la base vide.
- À revoir si : l'équipe Data écrit dans les mêmes tables depuis Python.
