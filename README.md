# Hackathon Givaudan 2026 – Kuami

Une API Express et un front Vite en TypeScript, avec une base PostgreSQL et un appel à une IA compatible OpenAI. Tout tourne dans un dev container.

## Stack

| Partie | Techno                                                | Dossier    |
| ------ | ----------------------------------------------------- | ---------- |
| API    | Node 24, Express 5, `pg`, TypeScript, tsx             | `api/`     |
| Front  | Vite (TypeScript)                                     | `web/`     |
| Base   | PostgreSQL 17                                         | `db/`      |
| IA     | Tout fournisseur compatible OpenAI (Ollama, Mistral…) | `api/.env` |

Le dépôt est un monorepo npm (workspaces `api` et `web`).

## Démarrer

Prérequis : Docker et VS Code avec l'extension **Dev Containers**.

1. Cloner le dépôt et l'ouvrir dans VS Code.
2. **Dev Containers: Reopen in Container**.

À la création, le conteneur lance `npm ci` et copie `api/.env.example` vers `api/.env`. PostgreSQL démarre en même temps et joue les scripts de `db/init/` au premier lancement.

3. Lancer l'API et le front :

```bash
npm run dev
```

- Front : http://localhost:5173 (les appels à `/api` passent par le proxy vers l'API)
- API : http://localhost:3000
- PostgreSQL : `localhost:5432`, utilisateur, mot de passe et base `app`

## Configuration de l'IA

Dans `api/.env`, décommentez l'une des options :

- **Ollama sur votre machine** (par défaut) : `AI_BASE_URL=http://host.docker.internal:11434/v1`, modèle `llama3.2:1b`. Pensez à faire `ollama pull llama3.2:1b`.
- **Fournisseur commercial** (par exemple Mistral) : renseignez `AI_BASE_URL`, `AI_MODEL` et `AI_API_KEY`.

Le fichier `.env` n'est jamais commité.

> L'option « Ollama en conteneur » de `.env.example` suppose un service `ollama` qui n'existe pas encore dans `compose.yaml`.

## API

| Méthode | Route            | Description                                                                      |
| ------- | ---------------- | -------------------------------------------------------------------------------- |
| GET     | `/api/health`    | Statut de l'API et version de PostgreSQL                                         |
| GET     | `/api/questions` | Les 10 dernières questions et leurs réponses                                     |
| POST    | `/api/questions` | Corps `{ "question": "..." }` : interroge l'IA, enregistre et renvoie la réponse |

## Base de données

- `db/init/001-schema.sql` : schéma (table `questions`)
- `db/init/002-seed.sql` : données de test

Les données sont stockées dans `db/data/` (ignoré par git). Ces scripts ne sont joués qu'au premier démarrage : pour repartir de zéro, arrêtez les conteneurs et supprimez `db/data/`.

## Scripts

| Commande               | Effet                                    |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Lance l'API et le front en parallèle     |
| `npm run build`        | Compile l'API (`tsc`) et le front (Vite) |
| `npm run lint`         | ESLint                                   |
| `npm run format`       | Formate le code avec Prettier            |
| `npm run format:check` | Vérifie le formatage                     |

## Qualité et contribution

- **Pre-commit** : Husky lance `lint-staged` (ESLint + Prettier sur les fichiers modifiés).
- **CI** (GitHub Actions) : sur chaque PR et chaque push sur `main` et `develop`, lint, vérification du formatage et build, avec la même image Node que le dev container.
- **Branches** : on part de `develop` avec une branche `feature/...` et on ouvre une PR vers `develop`. Remplissez le modèle de PR.
- **CODEOWNERS** : les tech leads relisent les changements sur `.devcontainer/`, `.github/`, `compose.yaml`, `eslint.config.mjs` et `package.json`.
- Le code produit avec une IA doit être relu et compris avant d'être proposé.
