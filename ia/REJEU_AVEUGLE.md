# Mode rejoué à l'aveugle — ticket #33 (partie Data)

Exécuté le 12/11/2026. Commande : `python src/rejeu_aveugle.py` (depuis `ia/`).

## Protocole
- **Tendance A** = pistache, T = 15/03/2024. **Tendance B** = Dalgona coffee, T = 15/03/2020. L'ordre A/B est fixé dans le script, avant tout résultat.
- Données : Google Trends, 5 pays (FR, US, JP, KR, AE), mensuel. À la date T, seuls les **mois complets** sont utilisés : jusqu'à février 2024 pour A, février 2020 pour B.
- Verdicts produits par `src/sillage_score.py` (score v1, seuils `config/seuils_score_v1.json`). Rien n'est écrit à la main.
- Sorties : `data/rejeu/rejeu_aveugle.json` (vue publique, noms masqués), `data/rejeu/cles_rejeu.json` (correspondance, à révéler après le verdict), `data/rejeu/prompts_llm.json`.
- Garde-fou automatique : le script vérifie que ni « pistache » ni « Dalgona » n'apparaissent dans la vue publique ni dans les prompts aveugles. Résultat : **aucune fuite**.

## Verdicts du système (score déterministe)

| Masque | Date figée | Score | Durée | Géographie | Verdict | Vrai nom | Correct ? |
|---|---|---|---|---|---|---|---|
| Tendance A | 2024-02 | **60,0** | 100 | 0 | **suivre** | pistache (durable) | Oui, mais pile sur le seuil |
| Tendance B | 2020-02 | **5,0** | 8,3 | 0 | **ignorer** | Dalgona (buzz) | Oui, faute de signal (voir ci-dessous) |

À lire honnêtement :
- A est « suivre » grâce à la **tenue** de l'intérêt (durée 100). Aucun pays n'est en forte hausse en février 2024 (géographie 0). Le score de 60,0 est exactement sur le seuil.
- B est « ignorer » parce qu'en février 2020 le Dalgona n'existe presque pas dans les recherches (un seul point à 5 en Corée). Le système ne « devine » pas un buzz : il ne recommande rien. Recalculé chaque mois, le Dalgona ne dépasse jamais « surveiller » (50 au maximum, avril à septembre 2020), voir `spike_11_google_trends.ipynb`.

## Test de contrôle : agents LLM, nom masqué puis nom visible

Même prompt, mêmes chiffres. Seul le nom change (« Tendance A » → « pistache », « Tendance B » → « Dalgona coffee »). Ollama local, température 0, graine 42, sortie JSON. Résultats bruts : `data/rejeu/resultats_llm_rejeu.json`.

| Modèle | Cas | Aveugle | Nom visible | Le nom change-t-il le verdict ? |
|---|---|---|---|---|
| qwen3.5:4b-q4_K_M | A (pistache) | durable (0,85) | durable (0,85) | Non |
| qwen3.5:4b-q4_K_M | B (Dalgona) | indéterminé (0,0) | indéterminé (0,1) | Non |
| qwen2.5:1.5b | A (pistache) | durable (0,8) | durable (0,8) | Non |
| qwen2.5:1.5b | B (Dalgona) | **durable (0,8)** | **durable (0,8)** | Non, mais **faux dans les deux cas** |

**Résultat, y compris ce qui est défavorable :**
- **Pas de triche par le nom observée** : sur ces 2 cas, afficher le vrai nom ne change le verdict d'aucun des deux modèles. Le biais de connaissance du futur n'apparaît pas ici, mais 2 cas ne suffisent pas à l'exclure.
- **qwen3.5:4b reste prudent** : sur B il répond « indéterminé » au lieu de « buzz ». C'est cohérent avec les données, qui sont quasi vides. En revanche, sa justification aveugle place le point isolé « au Japon » alors qu'il est en Corée : **petite hallucination** dans l'explication.
- **qwen2.5:1.5b n'est pas fiable** : il qualifie B de « durable » à 0,8 de confiance, contredit le score du système (5/100, ignorer), invente une « baisse constante » et une « forte popularité » absentes des chiffres, et range JP et KR parmi les « pays francophones ». Cela confirme le choix de qwen3.5:4b dans `benchmark_llm.pdf`.
- **Conséquence pour l'affichage** : le verdict affiché doit rester celui du **score**. Le LLM rédige l'explication, et celle-ci doit être vérifiée contre les chiffres (pays, mois) avant affichage.
