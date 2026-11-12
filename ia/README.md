# ia/ — notebooks Data (Sillage)

Notebooks des spikes Data (#11, #14, #17). Python local, hors dev container (le conteneur ne contient que Node).

## Installation (Windows, PowerShell)

```powershell
cd ia
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
jupyter notebook
```

Données brutes dans `ia/data/`.

## Données Wikipedia au format du cahier des charges (Data)

```
python src/wikipedia_vers_observations.py
```
Convertit `data/wikipedia/echantillon_pageviews.csv` en table `observations` (CSV + Parquet), avec
`metadata/search_manifest_wikipedia.csv`, `metadata/sources.csv`, `reports/quality_report_wikipedia.csv`
et `reports/ingestion_runs.csv`. Idempotent (relancer ne crée pas de doublon).
La langue Wikipedia est stockée dans `wiki_project` ; `country_iso2` reste vide (langue ≠ pays).
Dictionnaire des requêtes Google Trends pour le Tech : `metadata/dictionnaire_requetes.csv`.

## Tickets Data (12/11/2026)

| Ticket | Livrable | Résultat |
|---|---|---|
| #11 Spike Google Trends | `spike_11_google_trends.ipynb` | GO avec réserves : 3/3 avant le pic (le Dalgona est « ignoré » faute de signal, jamais recommandé ensuite) |
| #25 Score buzz / durable v1 | `src/sillage_score.py`, `config/seuils_score_v1.json`, `score_v1_evaluation.ipynb` | 2 critères (durée, géographie), déterministe, seuils versionnés, propagation entre pays |
| #33 Rejeu à l'aveugle (Data) | `src/rejeu_aveugle.py`, `data/rejeu/`, `REJEU_AVEUGLE.md` | A (pistache) → suivre, B (Dalgona) → ignorer ; test de contrôle LLM noté, y compris les défauts |
| #14 Spike prix matières | `spike_14_prix_matieres.ipynb`, `raw/prix/` | Seuil non atteint : cacao OK, pistache partielle, matcha sans série publique |
| #17 Spike zero-shot familles | `spike_17_zero_shot_familles.ipynb`, `data/spike17/` | Provisoire : 15/20 (75 %) avec le LLM local ; attend l'étiquetage Product et l'exécution du modèle Hugging Face |
| Livrable 4 : 30 cas de référence | `validation_30_cas.ipynb`, `raw/google_trends/reference/` | Voir le notebook |

### Commandes
```
pip install -r requirements.txt
python src/google_trends_import.py        # exports Google Trends -> observations + rapport qualité
python src/wikipedia_vers_observations.py # Wikipedia -> observations + rapport qualité
python src/sillage_score.py               # score v1 sur les 3 cas tests
python src/rejeu_aveugle.py               # rejeu nom masqué (#33)
jupyter nbconvert --to notebook --execute --inplace <notebook>.ipynb
```

### Collecte Google Trends
Exports faits le 12/11/2026 depuis l'interface Google Trends (même requête que le bouton « Télécharger CSV »), à rythme lent, sans compte ni contournement. Fichiers bruts inchangés dans `raw/google_trends/`, requêtes et URL dans `metadata/search_manifest_*.csv`. Valeurs relatives 0-100, renormalisées à chaque export : comparer des formes de courbes, pas des niveaux entre fichiers.
