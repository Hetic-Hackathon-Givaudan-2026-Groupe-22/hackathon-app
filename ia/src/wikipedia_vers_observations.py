"""
Sillage (G22 Auralis) — Conversion de l'échantillon Wikipedia au contrat de données
du cahier des charges de collecte (v1.0, 12/11/2026, section 04).

Entrée  : data/wikipedia/echantillon_pageviews.csv  (une ligne par terme x langue x mois)
Sorties : data/observations_wikipedia.csv / .parquet (table « observations »)
          metadata/search_manifest_wikipedia.csv     (une ligne par série terme x langue)
          metadata/sources.csv                       (table annexe « sources »)
          reports/quality_report_wikipedia.csv       (une ligne par série)
          reports/ingestion_runs.csv                 (un run par exécution, ajouté)

Règles appliquées (cahier des charges) :
- La langue Wikipedia est une dimension à part (wiki_project) ; country_iso2 reste NULL :
  un article lu en français ne prouve pas une demande en France.
- Mois absents conservés comme absents (NULL ≠ 0), comptés dans le rapport qualité.
- Mois en cours exclu (fenêtre incomplète). Aucun pic supprimé.
- Idempotent : observation_id = empreinte des clés ; relancer ne crée pas de doublon.

Usage (depuis le dossier ia/) :
    pip install pandas pyarrow
    python src/wikipedia_vers_observations.py
"""

import hashlib
import json
import os
from datetime import datetime, timezone

import pandas as pd

ICI = os.path.dirname(os.path.abspath(__file__))
IA = os.path.dirname(ICI)
ENTREE = os.path.join(IA, "data", "wikipedia", "echantillon_pageviews.csv")
RAW_REL = "data/wikipedia/echantillon_pageviews.csv"
SCRIPT_VERSION = "1.0.0"
COLLECTE_UTC = "2026-11-12T08:44:00Z"   # date de l'appel aux API Wikimedia
FIN_MAX = "2026-10"                     # dernier mois complet
SEUIL_UTILISABLE = 0.85                 # complétude minimale (cahier des charges, section 06)
MOIS_CONSECUTIFS_MIN = 24               # section 03, règles de dimensionnement
E = "utf-8-sig"

TOPICS = {  # terme du jeu de référence -> topic_id canonique (aligné avec dictionnaire_requetes.csv)
    "Matcha": "matcha", "Pistache": "pistachio", "Dalgona coffee": "dalgona_coffee",
    "Dubai chocolate": "dubai_chocolate", "Yuzu": "yuzu", "Ube": "ube",
    "Lait d'avoine": "oat_milk", "Kombucha": "kombucha", "Cold brew": "cold_brew_coffee",
    "Birria": "birria", "Gochujang": "gochujang", "Hot honey": "hot_honey",
    "Poke bowl": "poke_bowl", "Oud (parfum)": "oud", "Mochi": "mochi",
    "Espresso martini": "espresso_martini", "Grimace Shake": "grimace_shake",
    "Unicorn Frappuccino": "unicorn_frappuccino", "Raindrop cake": "raindrop_cake",
    "Butter board": "butter_board", "Pink Sauce": "pink_sauce", "Hojicha": "hojicha",
}
HORS_PERIMETRE = {"oud": "parfumerie, hors périmètre alimentaire du pilote"}
MAPPING_DOUTEUX = {
    "raindrop_cake": "pic anormal, page Wikipedia à vérifier",
    "pink_sauce": "page Wikipedia possiblement homonyme, à vérifier",
    "unicorn_frappuccino": "pic 2026 incohérent avec l'épisode 2017, redirection à vérifier",
}


def fin_de_mois(p: pd.Period) -> str:
    return p.end_time.strftime("%Y-%m-%d")


def main():
    run_id = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S") + "_wiki"
    df = pd.read_csv(ENTREE, encoding=E)
    brut = len(df)
    df = df[df["mois"] <= FIN_MAX].copy()
    rejets = []

    inconnus = sorted(set(df["terme"]) - set(TOPICS))
    for t in inconnus:
        rejets.append({"terme": t, "raison": "terme absent du dictionnaire de topics"})
    df = df[df["terme"].isin(TOPICS)]

    nv = pd.to_numeric(df["vues"], errors="coerce")
    for _, r in df[nv.isna() | (nv < 0)].iterrows():
        rejets.append({"terme": r.terme, "raison": f"valeur invalide {r.vues} ({r.langue} {r.mois})"})
    df = df[nv.notna() & (nv >= 0)]

    df["topic_id"] = df["terme"].map(TOPICS)
    per = pd.PeriodIndex(df["mois"], freq="M")
    df["period_start"] = per.start_time.strftime("%Y-%m-%d")
    df["period_end"] = [fin_de_mois(p) for p in per]

    def flags(row):
        f = []
        if row.topic_id in HORS_PERIMETRE:
            f.append("hors_perimetre")
        if row.topic_id in MAPPING_DOUTEUX:
            f.append("mapping_a_verifier")
        f.append("langue_non_pays")
        return json.dumps(f)

    obs = pd.DataFrame({
        "topic_id": df["topic_id"],
        "topic_label": df["terme"],
        "country_iso2": None,
        "wiki_project": df["langue"] + ".wikipedia",
        "period_start": df["period_start"],
        "period_end": df["period_end"],
        "frequency": "monthly",
        "source": "wikimedia_pageviews",
        "metric": "article_pageviews_user",
        "value": df["vues"].astype(float),
        "unit": "views_count",
        "query_original": df["article"],
        "normalization_scope_id": None,  # comptes absolus, pas d'échelle relative
        "source_url": df["source_api"],
        "page_url": df["page_wikipedia"],
        "raw_file": RAW_REL,
        "collected_at_utc": COLLECTE_UTC,
        "is_synthetic": False,
        "label_reference": df["label"],
        "license": "CC0 (Wikimedia pageviews)",
        "run_id": run_id,
    })
    obs["quality_flags"] = [flags(r) for r in obs.itertuples()]
    cle = obs["topic_id"] + "|" + obs["wiki_project"] + "|" + obs["source"] + "|" + obs["metric"] + "|" + obs["period_start"]
    obs.insert(0, "observation_id", [hashlib.sha1(k.encode()).hexdigest()[:16] for k in cle])
    doublons = int(obs.duplicated("observation_id").sum())
    obs = obs.drop_duplicates("observation_id").sort_values(["topic_id", "wiki_project", "period_start"])

    os.makedirs(os.path.join(IA, "metadata"), exist_ok=True)
    os.makedirs(os.path.join(IA, "reports"), exist_ok=True)
    obs.to_csv(os.path.join(IA, "data", "observations_wikipedia.csv"), index=False, encoding=E)
    try:
        obs.to_parquet(os.path.join(IA, "data", "observations_wikipedia.parquet"), index=False)
    except ImportError:
        print("pyarrow absent : Parquet non généré (pip install pyarrow)")

    # Manifeste + rapport qualité, une ligne par série topic x projet
    man, qr = [], []
    for (tid, proj), g in obs.groupby(["topic_id", "wiki_project"]):
        mois = pd.PeriodIndex(g["period_start"], freq="M")
        attendu = (pd.Period(FIN_MAX, "M") - mois.min()).n + 1
        observe = len(g)
        # plus longue suite de mois consécutifs
        s = sorted(m.ordinal for m in mois)
        best = cur = 1
        for a, b in zip(s, s[1:]):
            cur = cur + 1 if b - a == 1 else 1
            best = max(best, cur)
        compl = observe / attendu
        f = json.loads(g["quality_flags"].iloc[0])
        if "hors_perimetre" in f:
            statut = "exclu_perimetre"
        elif compl >= SEUIL_UTILISABLE and best >= MOIS_CONSECUTIFS_MIN:
            statut = "a_verifier" if "mapping_a_verifier" in f else "usable"
        else:
            statut = "insuffisant"
        first = g.iloc[0]
        man.append({
            "source": "wikimedia_pageviews", "query_original": first.query_original, "topic_id": tid,
            "wiki_project": proj, "country_iso2": None, "debut": mois.min().strftime("%Y-%m"), "fin": FIN_MAX,
            "frequency": "monthly", "categorie": "user / all-access", "source_url": first.source_url,
            "page_url": first.page_url, "normalization_scope_id": None, "raw_file": RAW_REL,
            "collected_at": COLLECTE_UTC,
        })
        qr.append({
            "run_id": run_id, "source": "wikimedia_pageviews", "topic_id": tid, "wiki_project": proj,
            "country": None, "expected": attendu, "observed": observe,
            "missing_pct": round(100 * (1 - compl), 1), "duplicates": 0,
            "max_mois_consecutifs": best, "status": statut, "flags": ";".join(f),
        })
    pd.DataFrame(man).to_csv(os.path.join(IA, "metadata", "search_manifest_wikipedia.csv"), index=False, encoding=E)
    qdf = pd.DataFrame(qr)
    qdf.to_csv(os.path.join(IA, "reports", "quality_report_wikipedia.csv"), index=False, encoding=E)
    if rejets:
        pd.DataFrame(rejets).to_csv(os.path.join(IA, "reports", "rejets_wikipedia.csv"), index=False, encoding=E)

    pd.DataFrame([
        {"source_id": "wikimedia_pageviews", "url_racine": "https://wikimedia.org/api/rest_v1/metrics/pageviews/",
         "methode": "API REST officielle (per-article, monthly, user)", "licence": "CC0",
         "date_acces": COLLECTE_UTC[:10], "restrictions": "User-Agent identifiable ; rythme limité",
         "limites": "langue ≠ pays ; vues humaines estimées (bots filtrés) ; articles absents pour certains buzz"},
        {"source_id": "wikidata", "url_racine": "https://www.wikidata.org/w/api.php",
         "methode": "API wbgetentities (sitelinks)", "licence": "CC0", "date_acces": COLLECTE_UTC[:10],
         "restrictions": "aucune authentification", "limites": "dépend du titre anglais choisi (redirections)"},
    ]).to_csv(os.path.join(IA, "metadata", "sources.csv"), index=False, encoding=E)

    chemin_runs = os.path.join(IA, "reports", "ingestion_runs.csv")
    run = pd.DataFrame([{
        "run_id": run_id, "script_version": SCRIPT_VERSION, "parametres": f"fin={FIN_MAX};seuil={SEUIL_UTILISABLE}",
        "horodatage_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "etat": "ok",
        "lignes_brutes": brut, "lignes_validees": len(obs), "lignes_rejetees": brut - len(obs),
        "doublons_supprimes": doublons, "erreur": "",
    }])
    run.to_csv(chemin_runs, mode="a", index=False, header=not os.path.exists(chemin_runs), encoding=E)

    print(f"{len(obs)} observations, {len(man)} séries, run {run_id}")
    print(qdf["status"].value_counts().to_string())


if __name__ == "__main__":
    main()
