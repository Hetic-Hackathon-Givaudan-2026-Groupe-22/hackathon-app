"""
Sillage (G22 Auralis) — Mode rejoué à l'aveugle (ticket #33, partie Data).

Rejoue Sillage à une date passée, nom masqué :
  - pistache, T = 15/03/2024  (données jusqu'à février 2024, dernier mois complet)
  - Dalgona coffee, T = 15/03/2020 (données jusqu'à février 2020)

Sorties :
  data/rejeu/rejeu_aveugle.json   -> ce que voient l'API / l'écran « Preuve » et les agents : « Tendance A », « Tendance B »
  data/rejeu/cles_rejeu.json      -> correspondance nom masqué -> vrai nom (révélée seulement après le verdict)
  data/rejeu/prompts_llm.json     -> prompts aveugles et prompts de contrôle (nom visible) pour les agents LLM

Les verdicts sont produits par src/sillage_score.py (score v1), jamais écrits à la main.
Usage (depuis ia/) : python src/rejeu_aveugle.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd  # noqa: E402
from sillage_score import charger_google_trends, score  # noqa: E402

IA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(IA, "data", "rejeu")

# Ordre fixé à l'avance (pas tiré du résultat) : A = pistache, B = Dalgona.
CAS = [
    {"masque": "Tendance A", "topic_id": "pistachio", "nom": "pistache", "date_figee": "2024-03-15"},
    {"masque": "Tendance B", "topic_id": "dalgona_coffee", "nom": "Dalgona coffee", "date_figee": "2020-03-15"},
]


def resume_series(series, T, mois=18):
    """Texte compact des 18 derniers mois connus à T, par pays : seule information donnée au LLM."""
    lignes = []
    for pays, s in sorted(series.items()):
        f = s[s.index <= T].tail(mois)
        lignes.append(f"{pays}: " + ", ".join(f"{p.strftime('%Y-%m')}={v:g}" for p, v in f.items()))
    return "\n".join(lignes)


def prompt(nom_affiche, T, resume, sc):
    return (
        "Tu es analyste tendances pour une entreprise d'arômes alimentaires. "
        f"Voici l'intérêt de recherche Google Trends (indice 0-100, mensuel, normalisé par pays) pour « {nom_affiche} », "
        f"connu jusqu'à {T} inclus. Tu ne connais rien d'autre et tu ne dois pas utiliser ce qui s'est passé après.\n\n"
        f"{resume}\n\n"
        f"Le score déterministe du système vaut {sc['score']}/100 (durée {sc['composantes']['duree']}, "
        f"géographie {sc['composantes']['geographie']}), verdict proposé : {sc['verdict_propose']}.\n"
        "Réponds en JSON : {\"verdict\": \"durable\" | \"buzz\" | \"indetermine\", \"confiance\": 0-1, "
        "\"justification\": \"2 phrases maximum, uniquement à partir des chiffres ci-dessus\"}"
    )


def main():
    os.makedirs(OUT, exist_ok=True)
    publics, cles, prompts = [], {}, []
    for c in CAS:
        series = charger_google_trends(c["topic_id"])
        sc = score(series, c["date_figee"], nom_affiche=c["masque"])
        T = pd.Period(sc["date_figee"], "M")
        publics.append(sc | {"date_rejeu": c["date_figee"], "source": "google_trends_ui, 5 pays, raw/google_trends/"})
        cles[c["masque"]] = {"topic_id": c["topic_id"], "nom": c["nom"]}
        res = resume_series(series, T)
        prompts.append({"masque": c["masque"], "type": "aveugle", "prompt": prompt(c["masque"], sc["date_figee"], res, sc)})
        prompts.append({"masque": c["masque"], "type": "controle_nom_visible", "prompt": prompt(c["nom"], sc["date_figee"], res, sc)})
    json.dump(publics, open(os.path.join(OUT, "rejeu_aveugle.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.dump(cles, open(os.path.join(OUT, "cles_rejeu.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.dump(prompts, open(os.path.join(OUT, "prompts_llm.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    for p in publics:
        print(p["tendance"], p["date_figee"], p["score"], p["composantes"], p["verdict_propose"])
    # garde-fou : le vrai nom ne doit apparaître ni dans la sortie publique ni dans les prompts aveugles
    texte = json.dumps(publics, ensure_ascii=False).lower() + " ".join(
        p["prompt"].lower() for p in prompts if p["type"] == "aveugle")
    fuites = [c["nom"] for c in CAS if c["nom"].lower() in texte or c["topic_id"] in texte]
    print("Fuite du vrai nom :", fuites or "aucune")


if __name__ == "__main__":
    main()
