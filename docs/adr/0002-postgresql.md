# 0002. Utiliser PostgreSQL 17 comme base de données

- Statut : acceptée
- Date : 2026-11-10
- Décideurs : Kuami (tech-lead)

## Contexte

L'API stocke les questions et les réponses de l'IA. L'équipe Data/IA lit ces données depuis ses notebooks pendant que l'API tourne. La production utilisera PostgreSQL 17.

## Options

1. PostgreSQL 17 : image officielle, accès simultanés, `psql` déjà dans le dev container. Un service de plus à lancer.
2. SQLite : aucun service. Un seul écrivain à la fois.
3. Base hébergée (Neon) : gratuit mais , devient couteux à long termes.

## Décision

Nous choisissons PostgreSQL 17, lancé par `compose.yaml`, parce que l'API et les notebooks lisent la même base en même temps, avec la version de la production.

## Conséquences

- Positives : schéma et données de test versionnés dans `db/init/`.
- Négatives, à accepter : un changement de schéma oblige à vider `db/data/`.
- À revoir si : le schéma change souvent, ce qui imposerait des migrations.
