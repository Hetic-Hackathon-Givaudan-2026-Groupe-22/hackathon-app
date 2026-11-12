# Contributions et attribution — Sillage / G22 Auralis

**Ce livrable V2 est présenté au nom de l'ensemble de l'équipe G22 / Auralis.**
Le code, les résultats et la documentation réunis ici servent de base commune à l'application Sillage.

## Contributions et provenance (faits établis)

| Périmètre | Attribution documentée |
|---|---|
| Vision produit, cas d'usage, arbitrages et intégration | Travail collectif de l'équipe G22 (pôles Product, Tech, Data/ML) |
| Collecte Google Trends et constitution des exports transmis | Joseph, en collaboration avec l'équipe Data et sur la base du cadrage/ressources de recherche partagés |
| Cadrage ML, audit/nettoyage, préparation des jeux, expérimentations M1–M4 et rapports | Travaux du pôle Data/ML, dont les expérimentations et scripts préparés par ROUA27 |
| Prototype RAG / benchmark synthétique | Travail de l'équipe sur `example-rag` ; statut expérimental et non intégré aux données métier |
| API du modèle et future intégration à l'application | Expérimentations FastAPI locales ; raccordement au backend principal à réaliser avec le pôle Tech |

**À compléter collectivement avant remise définitive** : noms/prénoms exacts des membres, contributions revues par chacun, versions acceptées et responsable des tests d'intégration. Le journal Git, les commentaires des Issues et les PR constituent la traçabilité individuelle. La mention « équipe » ne doit ni masquer le travail de collecte, ni attribuer à quelqu'un du travail qu'il n'a pas effectué.

## Règles d'attribution

- Ne pas remplacer les auteurs Git existants ni réécrire l'historique.
- Déposer le travail sur une branche de contribution, puis proposer une **Pull Request vers `develop`** après revue de l'équipe.
- Les **5 livrables** sont décrits dans [`LIVRABLES_V2.md`](LIVRABLES_V2.md).
- M1–M4 = expérimentations exécutées localement ; M5 = prototype RAG fictif non branché au métier.
