# Changelog — spécification maître M2L v1.1

**Date :** 9 novembre 2026

## Origine

v1.1 consolide `FINAL-MASTER-SPECIFICATION.md` v1.0 et les sept documents de `docs/feasibility/final/`. La v1.0 et les documents historiques sont conservés ; aucun code n’est modifié.

## Corrections et ajouts

### Dernière passe de cohérence

- opérations Marketing API d’écriture explicitement marquées **HORS MVP** ; le MVP conserve lecture et reporting ;
- Promote distingué entre statut de capacité **MANUEL** et statut d’exécution de test (`À TESTER`, `VALIDÉ`, `ÉCHEC`, `NON DISPONIBLE`) ;
- A08/P10 rendus non bloquants lorsqu’une absence d’exposition Promote est documentée avec preuve ;
- reporting alternatif Promote et provenance `PROMOTE_UI`/`MANUAL` explicités ;
- PostgreSQL RLS complété avec `SET LOCAL`, rôle sans `BYPASSRLS`, `FORCE ROW LEVEL SECURITY`, nettoyage transactionnel et contraintes Prisma/pool ;
- états locaux de publication ajoutés : `UPLOAD_INITIALIZED`, `UPLOADING`, `UPLOADED`, `PENDING_CREATOR_ACTION`, `PUBLISHING`, `PUBLISHED`, `FAILED`, `EXPIRED` ;
- reprise d’upload et URL expirée clarifiées : nouvel init contrôlé, historique conservé, idempotence et aucune double publication automatique ;
- quotas Content Posting revalidés par endpoint : Upload 6/min, Direct Post 6/min, Creator Info 20/min, Status Fetch 30/min ;
- critères de sortie du premier pilote séparés des tests de capacité 10/50/200 comptes.

- séparation explicite des OAuth TikTok Developer et TikTok for Business ;
- ajout des parcours, tokens, expirations, renouvellements, rotations et révocations indépendants ;
- ajout d’un `OAuthState` complet avec organisation, client et utilisateur initiateur ;
- protection documentée contre callbacks expirés, rejoués, mal routés ou inter-tenant ;
- quotas Content Posting associés à chaque endpoint et centralisés dans une configuration versionnée ;
- distinction renforcée entre `video.upload` et `video.publish` ;
- versioning Marketing API précisé sans généraliser uniformément v1.3 ;
- anciens endpoints de reporting marqués historiques/dépréciés et exclus du MVP ;
- aucune API Promote fictive ; Promote reste manuel assisté ;
- modèle complété avec `tenant_id`, statuts de vérification, preuves, dates d’observation, fonds observés et réconciliation ;
- ajout de `WebhookEvent`, déduplication et traitement hors ordre ;
- ajout de `OutboxEvent` et du pattern transactional outbox ;
- approbation financière rendue immuable avec snapshot des paramètres ;
- ajout des tests A10 à A16 ;
- A07 rendu explicitement obligatoire dans l’acceptation du premier pilote ;
- simulations 10/50/200 déplacées dans une validation de capacité post-pilote ;
- ajout de PostgreSQL RLS et des contrôles d’isolation au-delà des filtres Prisma ;
- décisions ouvertes et critères de maturité explicités.

## Informations conservées

La v1.1 conserve les objectifs, la stack, les rôles, le workflow Promote manuel, les limites de paiement, les références TikTok officielles, la roadmap et la décision `GO SOUS CONDITIONS` de la v1.0.

## Informations volontairement non confirmées

La v1.1 ne confirme pas la présence des campagnes Promote dans `/report/integrated/get/`, la gestion API des orders Promote, la cardinalité des liaisons Promote/Ads Manager, les permissions exactes de chaque compte Business, ni le mécanisme de signature webhook lorsqu’il n’est pas décrit par TikTok pour le produit concerné.
