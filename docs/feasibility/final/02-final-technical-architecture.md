# Architecture technique définitive du MVP

## Vue cible

```text
Next.js / Tailwind
        |
NestJS API -- RBAC / tenant guard / approval policy
        |
PostgreSQL + Prisma ---- Audit / état métier / snapshots
        |
Redis + BullMQ ---------- synchronisation / publication / réconciliation
        |
  +----------------------+----------------------+
  | Content Posting      | Marketing API        |
  | profil TikTok        | advertiser_id        |
  +----------------------+----------------------+
        |
   Promote manuel dans TikTok/Ads Manager
```

## Composants

- **Next.js** : navigation, formulaires, dashboards, écrans d’approbation ; aucun token fournisseur.
- **NestJS** : API métier, OAuth callbacks serveur, politiques RBAC, commandes idempotentes et adaptateurs TikTok.
- **PostgreSQL/Prisma** : tenant, clients, connexions, profils, annonceurs, contenu, ordres Promote, métriques et audit.
- **Redis/BullMQ** : synchronisations, polling, webhooks différés, rapports, réconciliation ; queues partitionnées par tenant et compte.
- **Socket.IO** : progression et notifications ; PostgreSQL reste la source de vérité.
- **Stockage objet S3-compatible** : médias et justificatifs, URL signées et rétention contrôlée.
- **KMS/secret manager** : chiffrement des access tokens, clés et secrets d’application.
- **Observabilité** : logs structurés redacted, métriques par endpoint/tenant, corrélation TikTok `log_id`.

## Séparation des adaptateurs

`ContentPostingAdapter` ne connaît que les profils TikTok et scopes Developer. `MarketingApiAdapter` ne connaît que les comptes annonceurs et autorisations Business. `PromoteManualWorkflow` ne fabrique aucun appel API non documenté ; il orchestre une tâche humaine et enregistre une preuve.

## Sécurité

- isolation tenant appliquée à chaque requête et job ;
- RBAC et contrôle de portée `client_id`/`advertiser_id` ;
- OAuth `state` à usage unique, expiration courte et callback HTTPS ;
- tokens chiffrés, jamais dans logs, URL ou frontend ;
- validation des URLs média et protection SSRF ;
- idempotency key sur chaque commande d’écriture ;
- budgets/plafonds et kill switch global ;
- aucun stockage de paiement ou identifiant de session TikTok.

## Scalabilité

Pour plusieurs centaines de comptes, le MVP doit prévoir rate limiting par token et compte, backoff borné, dead-letter queues, pagination, synchronisations étagées et réconciliation nocturne. La capacité réelle dépendra des limites TikTok et non seulement de l’infrastructure M2L.

## Statut des choix

| Élément | Statut |
|---|---|
| Next.js/NestJS/PostgreSQL/Prisma | CONFIRMÉE PAR DOCUMENTATION — choix interne adapté |
| Redis/BullMQ | CONFIRMÉE PAR DOCUMENTATION — choix interne adapté |
| Socket.IO | À TESTER — utile pour UX, non critique à la vérité métier |
| Content Posting API | À TESTER puis confirmée selon scopes/audit |
| Marketing API | À TESTER par compte annonceur et endpoint |
| Automatisation Promote | HORS MVP ; workflow MANUEL |
