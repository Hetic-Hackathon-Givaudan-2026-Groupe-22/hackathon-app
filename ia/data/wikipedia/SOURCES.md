# Sources — échantillon Wikipedia (thème 3, G22 Auralis)

Collecte du 2026-11-12, période 2015-07 → 2026-10 (mois en cours exclu).

| Donnée | Source | Licence |
|---|---|---|
| Vues mensuelles par article | Wikimedia Pageviews API — https://wikimedia.org/api/rest_v1/ (`per-article`, `all-access`, `user`, `monthly`) | CC0 (données d'audience Wikimedia) |
| Correspondance des articles entre langues | Wikidata API `wbgetentities` (sitelinks, redirections suivies) — https://www.wikidata.org/w/api.php | CC0 |
| Liste des 30 cas et labels tendance / buzz | `cas_reference.csv`, établie par l'équipe Data | — |

Langues : en, fr, es, de, it, pt, ja, ko, zh, ar.
Chaque ligne des CSV porte l'URL exacte de l'appel API (`source_api`) et la page Wikipedia correspondante.
Collecte via l'API officielle, sans compte ni contournement, avec pause entre requêtes ; aucune donnée personnelle.
