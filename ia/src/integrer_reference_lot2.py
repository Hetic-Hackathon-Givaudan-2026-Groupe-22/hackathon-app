"""
Intègre le lot 2 du référentiel (30 cas de plus : 15 tendances, 15 buzz) collecté sur Google Trends.

Entrées : export JSON du navigateur (chemin en argument), cas_reference_ajout_lot2.csv
Sorties : raw/google_trends/reference/gt__<sujet>__<zone>__2014-2026__monthly__001.csv (bruts)
          metadata/search_manifest_reference.csv (lignes ajoutées)
          cas_reference.csv (lot 2 ajouté)
          data/reference_60_cas_google_trends.csv (+ version 2019-2026 et tableau monde)
          reports/controle_labels_lot2.csv (contrôle descriptif des labels, pour audit humain)

Usage (depuis ia/) : python src/integrer_reference_lot2.py <export.json>
"""

import json
import os
import re
import subprocess
import sys

import pandas as pd

IA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = "utf-8-sig"


def slug(t):
    return re.sub(r"[^a-z0-9]+", "_", t.lower()).strip("_")


def main(export):
    os.chdir(IA)
    g = json.load(open(export, encoding="utf-8"))
    lot = pd.read_csv("cas_reference_ajout_lot2.csv", encoding="utf-8")
    man = pd.read_csv("metadata/search_manifest_reference.csv", encoding=E, dtype=str).fillna("")
    sujets = {slug(t) for t in lot.terme}
    man = man[~man.topic_id.isin(sujets)]  # idempotent
    new = []
    for key, v in g.items():
        terme, geo = key.split("||")
        s = slug(terme)
        f = f"raw/google_trends/reference/gt__{s}__{geo}__2014-2026__monthly__001.csv"
        open(f, "w", encoding="utf-8", newline="").write(v["txt"])
        new.append(dict(terme=terme, source="google_trends_ui", topic_id=s, country_iso2="" if geo == "WORLD" else geo,
                        query_original=v["query"], query_type="mot-clé", categorie="Toutes catégories (0)",
                        search_context="Web", debut="2014-01", fin="2026-10",
                        frequency="monthly" if v["resolution"] == "MONTH" else v["resolution"], source_url=v["url"],
                        normalization_scope_id=f"gt_ref_{s}_{geo}_20261112_002", raw_file=f, collected_at=v["at"],
                        query_version="ref_v2_lot2", statut="vide" if len(v["txt"].splitlines()) < 4 else "ok",
                        note_ambiguite="lot 2 : label proposé, à valider"))
    man = pd.concat([man, pd.DataFrame(new)], ignore_index=True)
    man.to_csv("metadata/search_manifest_reference.csv", index=False, encoding=E)

    c = pd.read_csv("cas_reference.csv")
    for col in ["lot", "statut_label", "justification_label"]:
        if col not in c:
            c[col] = {"lot": "lot1", "statut_label": "référence initiale", "justification_label": ""}[col]
    c = c[~c.terme.isin(lot.terme)]
    c = pd.concat([c, lot], ignore_index=True)
    c.to_csv("cas_reference.csv", index=False)

    subprocess.run([sys.executable, "src/google_trends_import.py"], check=True)

    o = pd.read_csv("data/observations_google_trends.csv", encoding=E)
    r = o[o.normalization_scope_id.str.startswith("gt_ref_") & ~o.normalization_scope_id.str.contains("_ja_")].copy()
    m = man[["topic_id", "terme"]].drop_duplicates()
    r = r.merge(m, on="topic_id").merge(c[["terme", "label", "lot"]], on="terme")
    r = r[r.label.isin(["tendance", "buzz"])]
    r["zone"] = r.country_iso2.fillna("WORLD")
    r["mois"] = r.period_start.str[:7]
    cols = ["terme", "topic_id", "label", "lot", "zone", "mois", "value", "query_original", "quality_flags",
            "source_url", "raw_file", "collected_at_utc"]
    out = r[cols].rename(columns={"value": "indice_0_100"}).sort_values(["label", "terme", "zone", "mois"])
    out.to_csv("data/reference_60_cas_google_trends.csv", index=False, encoding=E)
    f = out[(out.mois >= "2019-01") & (out.mois <= "2026-10")].copy()
    f["note"] = "extrait 2019-01→2026-10 d'un export 2014-2026 : échelle 0-100 relative au max 2014-2026"
    os.makedirs("data/fenetre_2019_2026", exist_ok=True)
    f.to_csv("data/fenetre_2019_2026/reference_60_cas_google_trends_2019_2026.csv", index=False, encoding=E)
    w = r[r.zone == "WORLD"].pivot(index="mois", columns="terme", values="value")
    w.to_csv("data/reference_60_cas_monde_large.csv", encoding=E)

    # Contrôle descriptif des labels du lot 2 (signale, ne corrige rien)
    ctl = []
    for t, s in w.items():
        if t not in set(lot.terme):
            continue
        s = s.dropna()
        lab = lot.set_index("terme").label[t]
        if s.max() <= 0:
            ctl.append(dict(terme=t, label=lab, alerte="aucune donnée mondiale"))
            continue
        ip = s.values.argmax()
        apres = s.values[ip + 1: ip + 13]
        maintien = float(apres.mean() / s.max()) if len(apres) >= 3 else None
        pic_mediane = float(s.max() / max(s[s > 0].median(), 1))
        alerte = ""
        if s.max() < 100 and s.max() == 0:
            alerte = "série vide"
        elif lab == "buzz" and maintien is not None and maintien >= 0.5:
            alerte = "buzz mais intérêt maintenu après le pic : label à vérifier"
        elif lab == "tendance" and maintien is not None and maintien < 0.25:
            alerte = "tendance mais forte retombée après le pic : label à vérifier"
        elif str(s.index[ip]) >= "2026-08":
            alerte = "pic très récent : recul insuffisant"
        ctl.append(dict(terme=t, label=lab, mois_pic=s.index[ip], maintien_12m=round(maintien, 2) if maintien is not None else None,
                        pic_sur_mediane=round(pic_mediane, 1), alerte=alerte))
    pd.DataFrame(ctl).to_csv("reports/controle_labels_lot2.csv", index=False, encoding=E)
    print(f"{out.terme.nunique()} cas :", out.drop_duplicates('terme').label.value_counts().to_dict())
    print(pd.DataFrame(ctl).to_string(index=False))


if __name__ == "__main__":
    main(sys.argv[1])
