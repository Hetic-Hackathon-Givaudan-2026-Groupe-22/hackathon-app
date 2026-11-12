# 0015. Simuler l'envoi des alertes et l'enregistrer en base

- Statut : acceptée
- Date : 2026-11-13
- Décideurs : Kuami (tech-lead)

## Contexte

US-29 demande d'envoyer une alerte par canal (e-mail, Teams, Slack) à des destinataires, et précise que l'envoi est simulé dans le prototype. Aucun compte de messagerie de Givaudan n'est disponible.

## Options

1. Envoi simulé, enregistré en base avec canal, destinataires et contenu : démontrable, rien ne sort. Rien n'arrive vraiment.
2. Vrai e-mail par SMTP (Nodemailer) : réaliste. Un serveur et des identifiants à gérer, risque d'envoi réel en démo.
3. Lien `mailto:` : rien côté serveur. Pas d'historique, et Teams ou Slack non couverts.

## Décision

Nous simulons l'envoi et l'enregistrons en base, parce que l'alerte doit être démontrable et tracée sans jamais partir vers une vraie boîte.

## Conséquences

- Positives : chaque envoi est relu dans l'historique avec son canal et ses destinataires.
- Négatives, à accepter : l'écran doit dire clairement que l'envoi est simulé.
- À revoir si : Givaudan fournit un canal de messagerie de test.
