# AGENTS.md

Sillage, détecteur de tendances (Givaudan AI Innovation Challenge, thème 3), équipe G22. Une API et un front en TypeScript, PostgreSQL 17, et le service Data Sillage en Python, dans un dev container VS Code. Présentation : `README.md`.

## Lancer

- Démo complète : `docker compose up` (base, API sur le port 3000, front sur le port 5173), ADR 0010.
- Dans le dev container : `npm run db:migrate -w api`, `npm run db:seed -w api`, puis `npm run dev`.
- `curl -s localhost:3000/api/health` doit répondre `"status":"ok"`.
- Avant de dire « fini » : `npm run lint`, `npm run format:check`, `npm run build`, `npm test`. Ce sont les contrôles du job `qualite` (`.github/workflows/ci.yml`).

## Règles

- API NestJS dans `api/src/` : un module par domaine (`tendances/`, `analyses/`), préfixe `/api` posé par `configure-app.ts`.
- Schéma dans `api/src/db/schema.ts` ; après une modification, `npm run db:generate -w api` crée la migration dans `api/drizzle/` (ADR 0006). `db/init/` ne crée que la base vide.
- Toute entrée de l'API est validée par un schéma Zod, `@Body({ schema })` ou `@Param(..., { schema })` (ADR 0008).
- L'analyse vient de l'interface `AnalyseProvider` ; aujourd'hui `AnalyseSimulee` (`mode: "dummy"`, ADR 0005). Le service Data se branchera là, contre `ia/openapi.yaml`, sans toucher au front.
- Front Next.js dans `web/app/`, composants daisyUI (ADR 0009) ; la logique testable va dans `web/lib/` avec son `*.spec.ts`.
- Front traduit avec next-intl (ADR 0016) : pages sous `web/app/[locale]/`, textes dans `web/messages/fr.json` et `en.json`, liens et navigation depuis `web/i18n/navigation.ts`.
- Le front n'appelle que `/api/…` (`web/lib/api.ts`) ; Next.js relaie vers `API_URL`.
- Une branche `feature/…` par ticket, depuis `develop`. La pull request vise `develop`, suit `.github/pull_request_template.md` et contient `Closes #N`.

## Décisions

- Lis `docs/adr/` avant d'ajouter une dépendance ou de changer de composant : dev container (0000), NestJS et Next.js (0001), PostgreSQL 17 (0002), service Data Sillage (0003), analyse simulée (0005), Drizzle (0006), suivi par interrogation (0007), Zod (0008), daisyUI (0009, remplacé par 0011), docker compose (0010).
- Ne contredis pas un ADR au statut « acceptée ».
- S'il faut en changer, propose un nouvel ADR, puis arrête-toi.

## À ne pas faire

- Modifier `ia/openapi.yaml` sans l'accord de l'équipe Data.
- Commiter une URL ngrok ou une clé : elles vont dans `api/.env`, jamais commité.
- Passer `--no-verify` à `git commit`, ou ajouter `eslint-disable`, pour faire passer un contrôle.
- Lancer `npm install` hors du conteneur : `package-lock.json` doit rester valable sous Linux.
