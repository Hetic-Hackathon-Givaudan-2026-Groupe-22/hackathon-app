# 0007. Suivre l'avancement de l'analyse par interrogation régulière

- Statut : acceptée
- Date : 2026-11-12
- Décideurs : Kuami (tech-lead)

## Contexte

US-14 et US-15 affichent un chronomètre et le statut de chaque agent pendant l'analyse. Le front passe par le relais `/api` de Next.js.

## Options

1. Interrogation toutes les secondes (`GET /api/analyses/:id`) : rien de nouveau, fonctionne à travers le relais. Une requête par seconde pendant l'analyse.
2. Server-Sent Events : mises à jour poussées. Connexion longue à faire passer par le relais de Next.js.
3. WebSocket : bidirectionnel. Un serveur de plus pour un besoin à sens unique.

## Décision

Nous interrogeons l'API toutes les secondes, parce que l'analyse dure moins d'une minute et que rien ne s'ajoute à la pile.

## Conséquences

- Positives : le même `GET` sert au suivi et à la relecture ; Pause, Précédent et Suivant (US-16) se jouent dans le navigateur.
- Négatives, à accepter : jusqu'à une seconde de retard sur l'affichage d'un statut.
- À revoir si : l'analyse réelle dure plusieurs minutes.
