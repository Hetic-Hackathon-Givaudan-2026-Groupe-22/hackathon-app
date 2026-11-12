# Dictionnaire des requêtes — Sillage P0 (v1, Data → Tech)

Réponse à la section 05 du cahier des charges de collecte (12/11/2026).
Fichier : `dictionnaire_requetes.csv`, une ligne par sujet × pays × requête.

## Comment l'utiliser dans Google Trends
1. Pour chaque pays, tester d'abord la requête `principale`, en mot-clé **et** en sujet (choisir le sujet proposé dans l'autocomplétion). Garder celui qui suit le mieux le contexte alimentaire, et noter lequel dans le manifeste.
2. Paramètres communs : 2019-01 → 2026-10, recherche Web, même catégorie pour tous les pays d'un même sujet.
3. Catégorie : tester « Alimentation et boissons » ; si la série devient vide ou très bruitée dans un pays, revenir à « Toutes catégories » **pour tous les pays du sujet**, et le noter.
4. Lignes `secondaire` : à exporter dans la même comparaison que la principale (même échelle) pour vérifier qu'elles racontent la même histoire.
5. Lignes `à tester` : uniquement si la principale donne une série vide ou trop faible. Pour AE, la requête en anglais est à tester car une grande partie de la population cherche en anglais.
6. Ne jamais additionner deux requêtes exportées séparément (échelles 0–100 différentes).

## Points de vigilance
- **dalgona_coffee** : exclure le bonbon dalgona (pic Squid Game, sept.–oct. 2021). En coréen, chercher `달고나 커피`, jamais `달고나` seul.
- **pistachio** : « vert pistache » est une couleur ; en arabe, `فستق` seul peut désigner l'arachide → préférer `فستق حلبي`.
- **matcha** : exclure les usages cosmétiques ; au Japon la série sera haute et saisonnière (produit ancien), ce n'est pas une anomalie.
- **dubai_chocolate** (option) : sujet surtout utile à partir de 2024 ; série vide avant, c'est normal (NULL ≠ 0).

## À valider
Statut actuel : proposé par Data (G22 Auralis), à relire par l'équipe. Toute modification → incrémenter `query_version`.
