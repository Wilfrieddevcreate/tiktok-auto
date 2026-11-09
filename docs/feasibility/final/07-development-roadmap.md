# Feuille de route de développement du MVP

## Phase 0 — décisions et accès

Valider marché, comptes pilotes, propriétaire des comptes, rôles VA/finance, app TikTok Developer, app Business, scopes, domaines média vérifiés, politique de confidentialité et comptes de démonstration. Dépendance bloquante : approbations et accès TikTok.

## Phase 1 — socle sécurisé

Tenant, Client, User, RBAC, OAuth state, secret manager, audit log, migrations PostgreSQL, Docker, CI et observabilité. Aucun appel d’écriture TikTok en production.

## Phase 2 — Content Posting vertical slice

Profils, média, `video.upload`, `video.publish` séparés, status fetch, webhooks, quotas, UX de consentement et preuve d’audit. Dépendances : scopes, app review, domaine vérifié, compte pilote.

## Phase 3 — Marketing API en lecture

Autorisation annonceur, découverte `advertiser_id`, campagnes/ad groups/ads, rapports et snapshots. Réconciliation manuelle avec Ads Manager. Dépendances : app Business, permission, compte annonceur et limites.

## Phase 4 — workflow Promote manuel

PromoteLink, tâches VA, éligibilité observée, approbation financière, preuves, liaison Ads Manager et suivi manuel. Ne pas créer d’adaptateur Promote fictif. Dépendances : compte éligible, procédures client et opérateur habilité.

## Phase 5 — contrôles production

Tests sécurité, isolation, charge, reprise, kill switch, alertes, runbooks, rétention, revue juridique et formation. Déploiement progressif sur quelques comptes.

## Phase 6 — décision d’extension

Après preuve réelle, décider séparément :

- extension du nombre de profils Content Posting ;
- écriture Marketing API ;
- exposition des Promote orders dans les rapports ;
- automatisation éventuelle d’un endpoint Promote officiellement documenté.

## Dépendances techniques transversales

- PostgreSQL/Prisma et migrations ;
- Redis/BullMQ et stratégie de rate limiting ;
- stockage objet et antivirus ;
- KMS/secret manager ;
- CI Jest/Playwright ;
- monitoring et alerting ;
- environnements test/recette/production séparés ;
- documentation TikTok surveillée pour dépréciations et changements de scopes.

## Jalons de décision

| Jalon | Décision |
|---|---|
| après Phase 0 | les accès TikTok rendent-ils le MVP possible ? |
| après Phase 2 | les deux parcours vidéo sont-ils compris et conformes ? |
| après Phase 3 | quels endpoints Marketing API sont réellement activables ? |
| après Phase 4 | quelle part de Promote reste manuelle et rentable ? |
| après Phase 5 | le système est-il sûr pour plusieurs clients ? |

Les délais de revue, audit, approbation et disponibilité régionale TikTok sont externes et ne doivent pas être inclus comme SLA garanti.
