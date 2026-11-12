# Sillage · Hackathon Givaudan 2026, groupe 22

Sillage aide une analyste Consumer Insights à distinguer un buzz passager d'une tendance durable. Cinq agents confrontent les preuves (recherches, lancements, prix des matières) ; Sillage propose un verdict sourcé, que l'analyste valide ou corrige.

> **Démonstration** : le service Data (modèle d'IA, `ia/openapi.yaml`) n'est pas encore branché. L'analyse est simulée par l'API (ADR 0005) et chaque écran le signale. Seul le prix de la pistache (Financial Times, 19/04/2025) est une donnée réelle.

## Lancer la démo

Prérequis : Docker.

```bash
docker compose up
```

- Front : http://localhost:5173
- API : http://localhost:3000/api/health

Au démarrage, l'API joue les migrations et les données de démonstration (6 tendances). Parcours : Tendances → Pistache → **Lancer l'analyse** → tour de table, lecture détaillée, verdict → **Valider** ou **Modifier**.

Les ports se changent avec `API_PORT` et `WEB_PORT` (par exemple `WEB_PORT=8080 docker compose up`).

## Développer

Prérequis : Docker et VS Code avec l'extension **Dev Containers**.

1. Cloner le dépôt et l'ouvrir dans VS Code, puis **Dev Containers: Reopen in Container**. Le conteneur lance `npm ci` et crée `api/.env`.
2. Dans le terminal du conteneur :

```bash
npm run db:migrate -w api
npm run db:seed -w api
npm run dev
```

## Stack

| Partie | Techno                                    | Dossier        |
| ------ | ----------------------------------------- | -------------- |
| API    | NestJS 12, Drizzle ORM, Zod, TypeScript   | `api/`         |
| Front  | Next.js 16, Tailwind CSS, daisyUI         | `web/`         |
| Base   | PostgreSQL 17, migrations Drizzle         | `api/drizzle/` |
| Data   | Service Sillage (Python), contrat OpenAPI | `ia/`          |

Les choix sont expliqués dans `docs/adr/`.

## API

| Méthode | Route                                    | Story         |
| ------- | ---------------------------------------- | ------------- |
| GET     | `/api/tendances?q=`                      | US-09, US-10  |
| GET     | `/api/tendances/:slug`                   | US-13         |
| POST    | `/api/analyses` `{ tendance }`           | US-14         |
| GET     | `/api/analyses/:id`                      | US-15 à US-24 |
| POST    | `/api/analyses/:id/verdict/validation`   | US-25         |
| POST    | `/api/analyses/:id/verdict/modification` | US-26         |

## Scripts

| Commande                    | Effet                                                     |
| --------------------------- | --------------------------------------------------------- |
| `npm run dev`               | API (port 3000) et front (port 5173)                      |
| `npm test`                  | Tests unitaires (API, front) et fonctionnels (API + base) |
| `npm run lint`              | ESLint                                                    |
| `npm run format:check`      | Vérifie le formatage Prettier                             |
| `npm run build`             | Compile l'API et le front                                 |
| `npm run db:migrate -w api` | Applique les migrations                                   |
| `npm run db:seed -w api`    | Réinsère les données de démonstration                     |

## Contribuer

- Un ticket par travail, une branche `feature/…` depuis `develop`, une pull request vers `develop` avec `Closes #N`, fusionnée en **Squash and merge**.
- La CI (`qualite`) joue lint, formatage, build, migrations et tests sur PostgreSQL 17.
- Husky lance `lint-staged` avant chaque commit.
