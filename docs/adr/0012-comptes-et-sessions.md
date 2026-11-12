# 0012. Gérer comptes et sessions dans l'API, sans service externe

- Statut : acceptée
- Date : 2026-11-13
- Décideurs : Kuami (tech-lead)

## Contexte

US-02 à US-04 demandent création de compte, connexion et changement de mot de passe. Les tendances suivies, le plan d'action et l'historique deviennent personnels. Le front appelle l'API par le relais `/api` de Next.js : même origine pour le navigateur.

## Options

1. Mots de passe hachés avec `scrypt` (`node:crypto`), sessions en base, cookie `httpOnly` : aucune dépendance, déconnexion immédiate possible. Code de sécurité écrit par nous.
2. Auth.js côté Next.js : connu et complet. Deuxième source de vérité sur l'utilisateur, à côté de l'API.
3. JWT signés, sans table de sessions : rien à stocker. Jeton impossible à révoquer avant son expiration.

## Décision

Nous gérons comptes et sessions dans l'API, mots de passe hachés par `scrypt` et session en base portée par un cookie `httpOnly`, parce que tout reste dans NestJS et PostgreSQL et qu'une session se supprime à la déconnexion.

## Conséquences

- Positives : un garde NestJS protège les routes ; le nom de la personne connectée signe les verdicts à la place de « Camille (démo) ».
- Négatives, à accepter : pas de récupération de mot de passe par e-mail.
- À revoir si : Givaudan impose sa connexion d'entreprise (SSO).
