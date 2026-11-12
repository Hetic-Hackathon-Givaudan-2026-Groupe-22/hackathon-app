"""
Hackathon Givaudan - Thème 3 (détecteur de tendances) - Premier échantillon Data

Récupère les vues mensuelles Wikipedia (API Wikimedia, open data) de chaque cas de
référence, dans plusieurs langues, puis calcule des indicateurs simples pour
distinguer une tendance durable d'un buzz.

Entrée  : cas_reference.csv  (terme, article_en, label, periode_buzz_ou_emergence)
Sorties : echantillon_pageviews.csv  (une ligne par terme x langue x mois)
          indicateurs.csv            (une ligne par terme : indicateurs + score baseline)
          introuvables.csv           (articles absents de Wikipedia -> Google Trends en repli)

Usage :
    pip install requests pandas
    python echantillon_wikipedia.py

Conformité : API officielle, sans login ni contournement, rythme limité (pause entre
requêtes), aucune donnée personnelle. Wikimedia exige un User-Agent identifiable :
remplacez CONTACT ci-dessous par l'adresse de l'équipe.
"""

import time
import urllib.parse

import pandas as pd
import requests

CONTACT = "equipe-data-theme3@example.com"  # <- à remplacer par votre contact
HEADERS = {"User-Agent": f"HETIC-Givaudan-Hackathon-Theme3/1.0 ({CONTACT})"}

LANGUES = ["en", "fr", "es", "de", "it", "pt", "ja", "ko", "zh", "ar"]
DEBUT = "2015070100"   # début des données par article de l'API Wikimedia
FIN = time.strftime("%Y%m01") + "00"
PAUSE_S = 0.2          # rythme raisonnable (rate limiting)
SEUIL_LANGUE_ACTIVE = 1000  # vues/mois au pic pour compter une langue comme "touchée"


def articles_par_langue(titre_en: str) -> dict:
    """Résout le titre anglais via Wikidata (suit les redirections) et renvoie
    {langue: titre canonique} pour les langues suivies."""
    r = requests.get(
        "https://www.wikidata.org/w/api.php",
        params={
            "action": "wbgetentities", "sites": "enwiki", "titles": titre_en,
            "props": "sitelinks", "redirects": "yes", "format": "json",
        },
        headers=HEADERS, timeout=30,
    )
    r.raise_for_status()
    entites = r.json().get("entities", {})
    for qid, ent in entites.items():
        if qid.startswith("Q"):
            liens = ent.get("sitelinks", {})
            return {
                lang: liens[f"{lang}wiki"]["title"]
                for lang in LANGUES if f"{lang}wiki" in liens
            }
    return {}


def vues_mensuelles(langue: str, titre: str) -> pd.Series:
    """Vues mensuelles (humains, tous appareils) d'un article."""
    t = urllib.parse.quote(titre.replace(" ", "_"), safe="")
    url = (
        "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
        f"{langue}.wikipedia/all-access/user/{t}/monthly/{DEBUT}/{FIN}"
    )
    r = requests.get(url, headers=HEADERS, timeout=30)
    if r.status_code == 404:
        return pd.Series(dtype="float64")
    r.raise_for_status()
    items = r.json().get("items", [])
    return pd.Series(
        {pd.Timestamp(i["timestamp"][:8]): i["views"] for i in items}, dtype="float64"
    )


def indicateurs(serie_totale: pd.Series, vues_par_langue: dict) -> dict:
    """Indicateurs simples et explicables pour séparer tendance et buzz."""
    s = serie_totale.sort_index()
    if s.empty or s.max() == 0:
        return {}
    pic = s.max()
    mois_pic = s.idxmax()
    apres = s[s.index > mois_pic].head(12)
    if len(apres) >= 3:
        maintien = float(apres.mean() / pic)
    else:  # pic très récent : on ne voit pas encore de retombée, on regarde les 3 derniers mois
        maintien = float(s.tail(3).mean() / pic)
    mois_depuis_pic = len(s[s.index > mois_pic])
    phase = "en croissance / au pic" if mois_depuis_pic < 6 else (
        "installée" if maintien >= 0.5 else "en déclin")
    persistance = int((s >= 0.3 * pic).sum())          # mois au-dessus de 30 % du pic
    base = s[s > 0].head(6).median()
    croissance = float(pic / base) if base else float("nan")  # pic / niveau de départ
    pointu = float(pic / s.median()) if s.median() else float("nan")  # pic / médiane
    langues_actives = sum(
        1 for v in vues_par_langue.values() if not v.empty and v.max() >= SEUIL_LANGUE_ACTIVE
    )
    # Score baseline 0-100 (pondérations à calibrer sur les 30 cas de référence)
    m = 0 if pd.isna(maintien) else min(maintien, 1)
    score = 100 * (0.5 * m + 0.3 * min(persistance / 24, 1) + 0.2 * min(langues_actives / 8, 1))
    return {
        "mois_pic": mois_pic.strftime("%Y-%m"),
        "phase": phase,
        "vues_pic": int(pic),
        "maintien_12m_apres_pic": round(maintien, 3) if not pd.isna(maintien) else None,
        "persistance_mois": persistance,
        "croissance_vs_depart": round(croissance, 1) if not pd.isna(croissance) else None,
        "pic_sur_mediane": round(pointu, 1) if not pd.isna(pointu) else None,
        "langues_actives": langues_actives,
        "score_baseline": round(score, 1),
        "prediction": "tendance" if score >= 40 else "buzz",
    }


def main():
    cas = pd.read_csv("cas_reference.csv")
    lignes, resultats, absents = [], [], []
    for _, c in cas.iterrows():
        print(f"-> {c.terme}")
        try:
            titres = articles_par_langue(c.article_en)
        except requests.RequestException as e:
            absents.append({"terme": c.terme, "article_en": c.article_en, "raison": str(e)})
            continue
        if not titres:
            absents.append({"terme": c.terme, "article_en": c.article_en, "raison": "article introuvable"})
            continue
        par_langue = {}
        for langue, titre in titres.items():
            v = vues_mensuelles(langue, titre)
            par_langue[langue] = v
            for mois, n in v.items():
                lignes.append({"terme": c.terme, "label": c.label, "langue": langue,
                               "article": titre, "mois": mois.strftime("%Y-%m"), "vues": int(n)})
            time.sleep(PAUSE_S)
        total = pd.concat(par_langue.values(), axis=1).sum(axis=1) if par_langue else pd.Series(dtype="float64")
        ind = indicateurs(total, par_langue)
        if ind:
            resultats.append({"terme": c.terme, "label": c.label,
                              "nb_langues_avec_article": len(titres), **ind})

    pd.DataFrame(lignes).to_csv("echantillon_pageviews.csv", index=False)
    res = pd.DataFrame(resultats)
    res.to_csv("indicateurs.csv", index=False)
    pd.DataFrame(absents).to_csv("introuvables.csv", index=False)

    print(f"\n{len(lignes)} lignes -> echantillon_pageviews.csv")
    print(f"{len(res)} termes -> indicateurs.csv ; {len(absents)} introuvables -> introuvables.csv")
    if not res.empty:
        exactitude = (res["label"] == res["prediction"]).mean()
        print(f"Baseline : {exactitude:.0%} de cas bien classés (sur {len(res)})")
        print(res[["terme", "label", "prediction", "score_baseline", "maintien_12m_apres_pic",
                   "persistance_mois", "langues_actives"]].to_string(index=False))


if __name__ == "__main__":
    main()
