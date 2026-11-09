# 0000. Développer dans un dev container VS Code, décrit dans le dépôt

- Statut : acceptée
- Date : 2026-11-09
- Décideurs : Kuami (tech-lead)

## Contexte

Le hackathon dure deux semaines et commence par un clonage du dépôt. L'équipe mêle développement web, Data/IA et Product, sur des machines différentes : macOS (Intel ou Apple Silicon), Windows, parfois Linux. Chacun a sa propre version de Node et de PostgreSQL, ou aucune.

Objectif fixé : chaque membre clone le dépôt et lance le projet en 15 minutes, quel que soit son ordinateur. Le tech-lead est seul pour dépanner : il ne peut pas passer la première journée à installer des outils sur chaque machine.

La production tournera sous Debian, avec Node 24 et PostgreSQL 17.

## Options

1. **Dev container VS Code** (`.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json`) **et `compose.yaml`, versionnés dans le dépôt.**
   Avantages : seuls Docker et VS Code sont à installer ; mêmes versions de Node, de `psql` et des extensions pour tous ; même système que la production (Debian) ; ESLint et Prettier branchés dans l'éditeur ; une modification de l'environnement passe par une pull request comme le code.
   Inconvénients : Docker Desktop consomme de la mémoire ; sous Windows, il faut WSL 2 et cloner le projet dans WSL ; le premier build de l'image prend plusieurs minutes ; dépendance à VS Code pour profiter de toute la configuration.

2. **Installation locale sur chaque machine, guidée par le README** (Node via nvm, PostgreSQL installé à la main).
   Avantages : aucun Docker ; outils natifs, plus rapides.
   Inconvénients : une procédure différente par système ; versions qui divergent d'une machine à l'autre ; bugs « ça marche sur ma machine » ; le tech-lead dépanne chaque poste.

3. **Docker Compose seul, sans dev container** (base et services en conteneur, code et Node sur la machine).
   Avantages : la base est identique pour tous ; libre choix de l'éditeur.
   Inconvénients : Node, npm et les extensions restent installés à la main et divergent ; le hook `pre-commit` s'exécute avec le Node de chaque machine.

## Décision

Nous choisissons l'option 1 : un dev container VS Code, construit à partir de `mcr.microsoft.com/devcontainers/typescript-node:24-trixie`, avec `compose.yaml` pour les services (PostgreSQL 17, le poste de travail `dev`). Parce que c'est la seule option qui garantit le même environnement sur macOS, Windows et Linux sans que le tech-lead installe quoi que ce soit poste par poste, et qui reste proche de la production (Debian, Node 24, PostgreSQL 17).

## Conséquences

- Positives : un nouvel arrivant n'installe que Docker et VS Code, puis **Reopen in Container** ; même Node, même `psql`, mêmes extensions et réglages (formatage à l'enregistrement) pour tous ; le hook `pre-commit` utilise le Node du conteneur ; l'environnement est relu en pull request (CODEOWNERS : `tech-leads`).
- Négatives, à accepter : Docker Desktop requis, gourmand en mémoire ; sous Windows, WSL 2 obligatoire et projet cloné dans WSL ; les commits doivent être faits depuis le dev container ; les données de PostgreSQL (`db/data`) restent locales à chaque machine.
- À revoir si : un membre ne peut pas faire tourner Docker sur sa machine, ou si l'équipe Data/IA a besoin d'un GPU que le conteneur n'expose pas.
