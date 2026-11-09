# 0001. Utiliser NestJS pour l'API et Next.js pour le front

- Statut : acceptée
- Date : 2026-11-09
- Décideurs : Kuami (tech-lead)

## Contexte

Le produit propose des services assistés par l'IA. L'API stocke les données dans PostgreSQL et appelle l'IA par HTTP ; les équipes Data/IA et Product s'appuient sur son contrat pour travailler. Le hackathon dure deux semaines, et le tech-lead est le seul à écrire et relire le code web. Le dev container, ESLint, Prettier et la CI sont déjà configurés pour Node 24 et TypeScript.

## Options

1. NestJS + Next.js : TypeScript partout, contrat OpenAPI généré depuis le code, déjà maîtrisés par le tech-lead. Plus de code de structure, deux serveurs à lancer.
2. Next.js seul, avec ses routes d'API : un seul projet à lancer. API mêlée au front, sans contrat OpenAPI natif.
3. Hono + Astro : très légers et rapides. Peu connus de l'équipe, peu d'aide en cas de blocage.
4. Django REST + Next.js : même langage que l'équipe Data/IA. Deux langages à relire, chaîne qualité à doubler.

## Décision

Nous choisissons NestJS pour `api/` et Next.js pour `web/`, parce que le tech-lead les maîtrise déjà, qu'ils gardent tout le code en TypeScript avec les outils en place, que NestJS sépare l'API du front, valide les données reçues et génère le contrat OpenAPI depuis le code, et que Next.js fournit routage et rendu serveur sans configuration.

## Conséquences

- Positives : ESLint, Prettier et la CI couvrent tout le code sans changement ; le contrat OpenAPI suit chaque modification de l'API.
- Négatives, à accepter : NestJS demande plus de code de structure (modules, décorateurs) pour chaque route, et deux serveurs sont à lancer en développement.
- À revoir si : les coéquipiers qui rejoignent le code web ne sont pas à l'aise avec NestJS après la première semaine.
