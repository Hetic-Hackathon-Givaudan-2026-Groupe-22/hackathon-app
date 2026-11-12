"""
Sillage (G22 Auralis) — Score buzz / durable v1 (ticket #25).

Calcul 100 % déterministe : même entrée, même score. Aucun appel à un LLM.
Les seuils sont lus dans config/seuils_score_v1.json (écrits avant le test sur le passé).

Entrée : un dictionnaire {zone: pandas.Series mensuelle indexée par Period('M')}.
   - zone = pays (Google Trends) ou projet linguistique (Wikipedia, à signaler : langue ≠ pays).
Date figée T : seules les valeurs <= T sont utilisées (pas de fuite du futur).

Usage :
    from sillage_score import charger_google_trends, score
    series = charger_google_trends("pistachio")
    resultat = score(series, date_figee="2024-02")
"""

import glob
import json
import os
from statistics import median

import pandas as pd

IA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEUILS = json.load(open(os.path.join(IA, "config", "seuils_score_v1.json"), encoding="utf-8"))


# ---------- chargement ----------

def _valeur(x):
    x = str(x).strip()
    if x.startswith("<"):          # Google Trends « < 1 » : intérêt non nul mais inférieur à 1
        return 0.5
    try:
        return float(x)
    except ValueError:
        return float("nan")


def lire_export_google_trends(chemin):
    """Lit un CSV brut exporté de Google Trends -> {libellé: Series mensuelle}. Fichier sans données -> {}."""
    lignes = open(chemin, encoding="utf-8").read().splitlines()
    if len(lignes) < 4:
        return {}
    df = pd.read_csv(chemin, skiprows=2, dtype=str)
    idx = pd.PeriodIndex(df.iloc[:, 0], freq="M")
    return {c: pd.Series([_valeur(v) for v in df[c]], index=idx, name=c) for c in df.columns[1:]}


def charger_google_trends(topic_id, dossier=None, pays=("FR", "US", "JP", "KR", "AE")):
    """{pays: Series} pour un sujet, à partir des exports bruts raw/google_trends/."""
    dossier = dossier or os.path.join(IA, "raw", "google_trends")
    out = {}
    for p in pays:
        f = glob.glob(os.path.join(dossier, f"gt__{topic_id}__{p}__*.csv"))
        if not f:
            continue
        s = lire_export_google_trends(sorted(f)[-1])
        if s:
            out[p] = list(s.values())[0]
    return out


def charger_wikipedia(terme, chemin=None):
    """{projet linguistique: Series} à partir de data/wikipedia/echantillon_pageviews.csv (comptes absolus)."""
    chemin = chemin or os.path.join(IA, "data", "wikipedia", "echantillon_pageviews.csv")
    d = pd.read_csv(chemin, encoding="utf-8-sig")
    d = d[d["terme"] == terme]
    out = {}
    for lang, g in d.groupby("langue"):
        s = pd.Series(g["vues"].values, index=pd.PeriodIndex(g["mois"], freq="M")).sort_index()
        # remise à l'échelle 0-100 sur toute la série, pour appliquer les mêmes seuils de niveau
        out[f"{lang}.wikipedia"] = 100 * s / s.max() if s.max() > 0 else s
    return out


# ---------- critères ----------

def _fenetre(s, T, debut, fin):
    """Valeurs de s entre T-debut et T-fin (en mois, bornes incluses)."""
    return s[(s.index >= T - debut) & (s.index <= T - fin)].dropna()


def critere_duree(s, T):
    f = _fenetre(s, T, SEUILS["fenetre_mois"] - 1, 0)
    if f.empty or f.max() <= 0:
        return None
    return float((f >= SEUILS["duree"]["seuil_relatif_max"] * f.max()).sum() / SEUILS["fenetre_mois"])


def zone_en_hausse(s, T):
    base = _fenetre(s, T, SEUILS["base_debut_mois"], SEUILS["base_fin_mois"])
    rec = _fenetre(s, T, SEUILS["recent_mois"] - 1, 0)
    if rec.empty:
        return False
    b = float(base.median()) if not base.empty else 0.0
    r = float(rec.mean())
    g = SEUILS["geographie"]
    return r >= g["niveau_min_recent"] and r >= g["ratio_hausse"] * b


def a_un_signal(s, T):
    f = _fenetre(s, T, SEUILS["fenetre_mois"] - 1, 0)
    return (not f.empty) and f.max() >= SEUILS["signal_min"]["niveau"]


def apparition(s, T):
    """Premier mois <= T où l'intérêt atteint 2x la base glissante (médiane des 12 mois précédents) et 10 points."""
    p = SEUILS["propagation"]
    s = s[s.index <= T].dropna()
    for m in s.index:
        prev = s[(s.index >= m - 12) & (s.index < m)]
        b = float(prev.median()) if len(prev) >= 6 else None
        if b is None:
            continue
        if s[m] >= p["niveau_apparition"] and s[m] >= p["ratio_apparition"] * max(b, 1.0):
            return m
    return None


# ---------- score ----------

def score(series, date_figee, nom_affiche="Tendance A"):
    """Score 0-100 + composantes + verdict + propagation, à la date figée T (format 'AAAA-MM' ou date)."""
    d = str(date_figee)
    T = pd.Period(d[:7], freq="M")
    if len(d) > 7:          # date précise (ex. 2024-03-15) : le mois en cours n'est pas complet -> dernier mois complet
        T = T - 1
    zones = {z: s[s.index <= T] for z, s in series.items()}
    zones_signal = {z: s for z, s in zones.items() if a_un_signal(s, T)}

    durees = [d for d in (critere_duree(s, T) for s in zones_signal.values()) if d is not None]
    duree = 100 * median(durees) if durees else 0.0
    hausses = [z for z, s in zones.items() if zone_en_hausse(s, T)]
    geo = 100 * len(hausses) / len(zones) if zones else 0.0
    w = SEUILS["poids"]
    sc = round(w["duree"] * duree + w["geographie"] * geo, 1)

    v = SEUILS["verdict"]
    if not zones_signal:
        verdict, motif = "ignorer", "signal insuffisant (aucune zone au-dessus du niveau minimal)"
    elif sc >= v["suivre"]:
        verdict, motif = "suivre", "intérêt tenu dans le temps"
    elif sc >= v["surveiller"]:
        verdict, motif = "surveiller", "signal présent mais tenue ou diffusion incomplète"
    else:
        verdict, motif = "ignorer", "intérêt bref ou peu diffusé"

    apparitions = {z: apparition(s, T) for z, s in zones.items()}
    vus = sorted([(m, z) for z, m in apparitions.items() if m is not None])
    ordre = [{"zone": z, "mois": str(m), "decalage_mois": (m - vus[0][0]).n} for m, z in vus]

    return {
        "tendance": nom_affiche,
        "date_figee": str(T),
        "score": sc,
        "composantes": {"duree": round(duree, 1), "geographie": round(geo, 1)},
        "verdict_propose": verdict,
        "motif": motif,
        "zones_observees": sorted(zones),
        "zones_avec_signal": sorted(zones_signal),
        "zones_en_hausse": sorted(hausses),
        "propagation": ordre,
        "version": SEUILS["_version"],
        "mode": "rejoue" if T < pd.Period(pd.Timestamp.today(), "M") - 1 else "actuel",
    }


if __name__ == "__main__":
    for t, T in [("pistachio", "2024-02"), ("dalgona_coffee", "2020-02"), ("matcha", "2024-02")]:
        print(t, json.dumps(score(charger_google_trends(t), T), ensure_ascii=False))
