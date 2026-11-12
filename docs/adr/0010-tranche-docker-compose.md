# 0010. Lancer la tranche complète avec docker compose up

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

La m2 exige que `docker compose up` seul lance la tranche, de l'écran aux données. Jusqu'ici, le service `dev` attendait (`sleep infinity`) et l'API et le front se lançaient à la main dans le dev container.

## Options

1. Services `api` et `web` dans `compose.yaml`, sur l'image du dev container : une seule image, migrations et données de démonstration jouées au démarrage. Le front tourne en mode développement.
2. Images de production dédiées (Dockerfile multi-étapes) : plus proche de la production. Deux images de plus à écrire et à maintenir avant demain.
3. Un script `npm run demo` dans le dev container : rien à changer à Docker. Ne répond pas au critère de la m2.

## Décision

Nous ajoutons `api` et `web` à `compose.yaml` sur l'image du dev container, parce que `docker compose up` démarre alors base, API et front dans le bon ordre, sans nouvelle image.

## Conséquences

- Positives : un clone neuf démarre avec `docker compose up` ; VS Code ne lance que `dev` et `db` (`runServices`).
- Négatives, à accepter : chaque démarrage rejoue les données de démonstration et efface les analyses précédentes.
- À revoir si : la tranche doit être déployée, ce qui demanderait des images de production.
