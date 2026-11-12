"""
Sillage (G22 Auralis) — Import des exports Google Trends (lot P0) au contrat « observations »
du cahier des charges de collecte (v1.0, section 04).

Entrées : raw/google_trends/*.csv (exports bruts, jamais modifiés)
          metadata/search_manifest_google_trends.csv
Sorties : data/observations_google_trends.csv / .parquet
          reports/quality_report_google_trends.csv
          reports/ingestion_runs.csv (ajout)

Règles : « < 1 » -> 0.5 + flag ; fichier vide -> série en échec dans le rapport (aucune valeur inventée) ;
idempotent (observation_id = empreinte des clés).

Usage (depuis ia/) : python src/google_trends_import.py
"""

import hashlib
import json
import os
from datetime import datetime, timezone

import pandas as pd

IA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = "utf-8-sig"
SCRIPT_VERSION = "1.0.0"
SEUIL_UTILISABLE = 0.85


def main():
    run_id = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S") + "_gt"
    manifestes = ["search_manifest_google_trends.csv", "search_manifest_reference.csv"]  # lot P0 + 30 cas de référence
    man = pd.concat([pd.read_csv(os.path.join(IA, "metadata", f), encoding=E, dtype=str)
                     for f in manifestes if os.path.exists(os.path.join(IA, "metadata", f))], ignore_index=True).fillna("")
    obs, qr, brut, rejets = [], [], 0, 0
    for m in man.itertuples():
        chemin = os.path.join(IA, m.raw_file)
        lignes = open(chemin, encoding="utf-8").read().splitlines()
        attendu = (pd.Period(m.fin, "M") - pd.Period(m.debut, "M")).n + 1
        if len(lignes) < 4:
            qr.append(dict(run_id=run_id, source="google_trends_ui", topic_id=m.topic_id, country=m.country_iso2 or "WORLD",
                           query_original=m.query_original, expected=attendu, observed=0, missing_pct=100.0, duplicates=0,
                           inferieur_a_1=0, status="vide", flags="aucune donnée renvoyée par Google Trends"))
            continue
        df = pd.read_csv(chemin, skiprows=2, dtype=str)
        for col in df.columns[1:]:
            requete = col.split(":")[0].strip()
            n_inf = 0
            for mois, v in zip(df.iloc[:, 0], df[col]):
                brut += 1
                v = str(v).strip()
                flags = []
                if v.startswith("<"):
                    val, n_inf = 0.5, n_inf + 1
                    flags.append("inferieur_a_1")
                else:
                    try:
                        val = float(v)
                    except ValueError:
                        rejets += 1
                        continue
                if not 0 <= val <= 100:
                    rejets += 1
                    continue
                p = pd.Period(mois, "M")
                topic = m.topic_id
                if topic == "comparaison_monde":
                    topic = {"matcha": "matcha", "pistachio": "pistachio", "dalgona coffee": "dalgona_coffee"}.get(requete, requete)
                obs.append(dict(
                    topic_id=topic, country_iso2=m.country_iso2 or None,
                    period_start=p.start_time.strftime("%Y-%m-%d"), period_end=p.end_time.strftime("%Y-%m-%d"),
                    frequency=m.frequency, source="google_trends_ui", metric="search_interest_index",
                    value=val, unit="index_0_100", query_original=requete,
                    normalization_scope_id=m.normalization_scope_id, source_url=m.source_url, raw_file=m.raw_file,
                    collected_at_utc=m.collected_at, is_synthetic=False, quality_flags=json.dumps(flags),
                    license="Google Trends — usage selon conditions Google ; données relatives 0-100", run_id=run_id))
            qr.append(dict(run_id=run_id, source="google_trends_ui", topic_id=m.topic_id if m.topic_id != "comparaison_monde" else f"comparaison:{requete}",
                           country=m.country_iso2 or "WORLD", query_original=requete, expected=attendu, observed=len(df),
                           missing_pct=round(100 * (1 - len(df) / attendu), 1), duplicates=0, inferieur_a_1=n_inf,
                           status="usable" if len(df) / attendu >= SEUIL_UTILISABLE else "insuffisant",
                           flags="valeurs <1 remplacées par 0.5" if n_inf else ""))
    o = pd.DataFrame(obs)
    cle = o.topic_id + "|" + o.country_iso2.fillna("WORLD") + "|" + o.source + "|" + o.metric + "|" + o.period_start + "|" + o.normalization_scope_id
    o.insert(0, "observation_id", [hashlib.sha1(k.encode()).hexdigest()[:16] for k in cle])
    dup = int(o.duplicated("observation_id").sum())
    o = o.drop_duplicates("observation_id")
    os.makedirs(os.path.join(IA, "reports"), exist_ok=True)
    o.to_csv(os.path.join(IA, "data", "observations_google_trends.csv"), index=False, encoding=E)
    try:
        o.to_parquet(os.path.join(IA, "data", "observations_google_trends.parquet"), index=False)
    except ImportError:
        print("pyarrow absent : Parquet non généré")
    q = pd.DataFrame(qr)
    q.to_csv(os.path.join(IA, "reports", "quality_report_google_trends.csv"), index=False, encoding=E)
    runs = os.path.join(IA, "reports", "ingestion_runs.csv")
    pd.DataFrame([dict(run_id=run_id, script_version=SCRIPT_VERSION, parametres=f"seuil={SEUIL_UTILISABLE}",
                       horodatage_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"), etat="ok",
                       lignes_brutes=brut, lignes_validees=len(o), lignes_rejetees=rejets, doublons_supprimes=dup, erreur="")]
                 ).to_csv(runs, mode="a", index=False, header=not os.path.exists(runs), encoding=E)
    print(f"{len(o)} observations ; {len(q)} séries ; run {run_id}")
    print(q.status.value_counts().to_string())


if __name__ == "__main__":
    main()
