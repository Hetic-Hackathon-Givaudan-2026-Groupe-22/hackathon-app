# AGENTS.md

Sillage, détecteur de tendances (Givaudan AI Innovation Challenge, thème 3), équipe G22. Une API et un front en TypeScript, PostgreSQL 17, et le service Data Sillage en Python, dans un dev container VS Code. Présentation : `README.md`.

## Lancer

Toutes les commandes se lancent dans le dev container.

- `npm run dev` : API sur le port 3000, front sur le port 5173.
- `curl -s localhost:3000/api/health` doit répondre `"status":"ok"`.
- Le service Data Sillage tourne sur le port 8000 ; sa santé : `GET /sillage/health`.
- Avant de dire « fini » : `npm run lint`, `npm run format:check`, `npm run build`. Ce sont les contrôles du job `qualite` (`.github/workflows/ci.yml`).

## Règles

- Le contrat du service Data est `ia/openapi.yaml`. Code contre lui, n'invente pas de route : le score passe par `POST /sillage/score`.
- Le service répond en mode `dummy` (réponses factices, exemples `pistache`, `dalgona`, `matcha`). Le passage à `reel` ne doit pas changer le code de l'API.
- L'API est encore en Express (`api/src/index.ts`) et passe à NestJS (ADR 0001) : n'ajoute pas de route Express.
- Le schéma et les données de test sont dans `db/init/`, joués au premier démarrage seulement : un changement de schéma oblige à vider `db/data/`.
- La configuration est dans `api/.env`, créé depuis `api/.env.example` à la création du conteneur.
- Une branche `feature/…` par ticket, depuis `develop`. La pull request vise `develop`, suit `.github/pull_request_template.md` et contient `Closes #N`.

## Décisions

- Lis `docs/adr/` avant d'ajouter une dépendance ou de changer de composant : dev container (0000), NestJS et Next.js (0001), PostgreSQL 17 (0002), service Data Sillage (0003).
- Ne contredis pas un ADR au statut « acceptée ».
- S'il faut en changer, propose un nouvel ADR, puis arrête-toi.

## À ne pas faire

- Modifier `ia/openapi.yaml` sans l'accord de l'équipe Data.
- Commiter une URL ngrok ou une clé : elles vont dans `api/.env`, jamais commité.
- Passer `--no-verify` à `git commit`, ou ajouter `eslint-disable`, pour faire passer un contrôle.
- Lancer `npm install` hors du conteneur : `package-lock.json` doit rester valable sous Linux.
