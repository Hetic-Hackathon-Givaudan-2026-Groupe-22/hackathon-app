"""
Tests des critères d'acceptation du ticket P1 (#23) — Courbes de recherche réelles.

1. Une série par pays est enregistrée pour une tendance et une zone.
2. Aucune donnée postérieure à la date T n'est utilisée (pas de fuite du futur).
3. Relancer l'import redonne le même fichier (idempotence).

Usage (depuis ia/) : python -m unittest discover -s tests -v
"""

import hashlib
import os
import subprocess
import sys
import unittest

import pandas as pd

IA = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(IA, "src"))
from sillage_score import charger_google_trends, score  # noqa: E402

PAYS = ["FR", "US", "JP", "KR", "AE"]
E = "utf-8-sig"


def empreinte(chemin):
    d = pd.read_csv(chemin, encoding=E).drop(columns=["run_id"], errors="ignore")
    d = d.sort_values(list(d.columns)).reset_index(drop=True)
    return hashlib.sha256(d.to_csv(index=False).encode()).hexdigest()


class TestP1(unittest.TestCase):

    def test_1_une_serie_par_pays(self):
        """Pour chaque sujet du lot P0, une série par pays pilote (sauf requête sans données, signalée)."""
        man = pd.read_csv(os.path.join(IA, "metadata", "search_manifest_google_trends.csv"), encoding=E, dtype=str).fillna("")
        for t in ["matcha", "pistachio", "dalgona_coffee", "dubai_chocolate"]:
            pays_manifeste = set(man[man.topic_id == t].country_iso2) - {""}
            self.assertEqual(pays_manifeste, set(PAYS), t)
            series = charger_google_trends(t)
            vides = {p for p in PAYS if p not in series}
            # une série absente n'est acceptée que si l'export brut est vide (aucune valeur inventée)
            for p in vides:
                f = man[(man.topic_id == t) & (man.country_iso2 == p)].raw_file.iloc[0]
                self.assertLess(len(open(os.path.join(IA, f), encoding="utf-8").read().splitlines()), 4, f"{t} {p}")

    def test_2_aucune_donnee_apres_T(self):
        """Le score à T ne change pas si l'on modifie, ajoute ou supprime des données après T."""
        for t, T in [("pistachio", "2024-03-15"), ("dalgona_coffee", "2020-03-15"), ("matcha", "2023-06")]:
            series = charger_google_trends(t)
            ref = score(series, T)
            dernier = pd.Period(ref["date_figee"], "M")
            futur_modifie = {p: s.where(s.index <= dernier, 100.0) for p, s in series.items()}
            futur_supprime = {p: s[s.index <= dernier] for p, s in series.items()}
            for variante in (futur_modifie, futur_supprime):
                r = score(variante, T)
                self.assertEqual((r["score"], r["composantes"], r["verdict_propose"]),
                                 (ref["score"], ref["composantes"], ref["verdict_propose"]), t)
            # aucune date de propagation postérieure à T
            for p in ref["propagation"]:
                self.assertLessEqual(pd.Period(p["mois"], "M"), dernier, t)

    def test_3_relance_meme_fichier(self):
        """Relancer l'import Google Trends redonne les mêmes observations."""
        sortie = os.path.join(IA, "data", "observations_google_trends.csv")
        cmd = [sys.executable, os.path.join(IA, "src", "google_trends_import.py")]
        subprocess.run(cmd, check=True, capture_output=True)
        a = empreinte(sortie)
        subprocess.run(cmd, check=True, capture_output=True)
        self.assertEqual(a, empreinte(sortie))


if __name__ == "__main__":
    unittest.main(verbosity=2)
