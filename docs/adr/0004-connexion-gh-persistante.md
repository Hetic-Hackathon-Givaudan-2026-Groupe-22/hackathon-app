# 0004. Conserver la connexion gh dans un volume Docker

- Statut : acceptée
- Date : 2026-11-11
- Décideurs : Kuami (tech-lead)

## Contexte

`gh` et les assistants de code accèdent à GitHub depuis le dev container. Leur jeton est rangé dans `~/.config/gh`, effacé à chaque **Rebuild Container**. L'agent SSH de VS Code ne sert que son propre terminal.

## Options

1. Volume Docker `gh-config` sur `~/.config/gh` : une seule connexion, gardée après un rebuild. Un volume à supprimer pour se déconnecter.
2. `gh auth login` après chaque rebuild : rien à configurer. Connexion perdue sans prévenir.
3. Jeton dans `api/.env` : déjà ignoré par git. Mélange un secret personnel et la configuration de l'API.

## Décision

Nous montons le volume `gh-config` dans `compose.yaml`, parce que la connexion survit au rebuild sans écrire de secret dans le dossier du projet.

## Conséquences

- Positives : `gh` et `git push` en HTTPS fonctionnent dès le conteneur reconstruit.
- Négatives, à accepter : le jeton reste sur la machine tant que `gh auth logout` n'est pas lancé.
- À revoir si : un membre partage sa machine avec une autre personne.
