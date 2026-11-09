# M2L TikTok Ads Operations — spécification maître du MVP v1.1

**Date de vérification documentaire : 9 novembre 2026**  
**Statut :** spécification de référence pour le MVP ; aucun développement inclus.

## 0. Convention de statut

Chaque capacité possède un seul statut principal :

- **CONFIRMÉ PAR DOCUMENTATION** : la capacité est documentée officiellement ou constitue une décision interne du produit ;
- **À TESTER** : le comportement dépend d’un compte, d’un marché, d’un scope, d’un audit ou d’un endpoint à confirmer ;
- **MANUEL** : l’action est réalisée par un utilisateur habilité dans TikTok ou Ads Manager ;
- **HORS MVP** : l’action n’est pas livrée dans le périmètre initial.

Une décision interne ne doit jamais être présentée comme une capacité TikTok garantie. Pour les tables, le statut est dans une colonne dédiée et les détails sont dans une colonne Commentaire/Mode d’exécution.

## 1. Présentation et décision de périmètre

M2L est une plateforme interne multi-tenant pour centraliser les profils TikTok, comptes annonceurs, publications, campagnes, tâches VA, approbations, rapports et preuves d’opérations. Elle n’est pas un remplacement de TikTok, Ads Manager ou Promote.

Les trois domaines restent strictement indépendants :

| Domaine | Statut MVP | Source de vérité |
|---|---|---|
| Content Posting API | **À TESTER** | TikTok Developer + profil autorisé |
| Marketing API | **À TESTER** | TikTok for Business + `advertiser_id` autorisé |
| TikTok Promote | **MANUEL** | Promote/Ads Manager UI ; aucune API Promote confirmée |

Le MVP comprend les tenants, clients, RBAC, OAuth séparés, profils, annonceurs, contenu, publication, synchronisation en lecture, reporting, workflow Promote manuel, approbations, audit, preuves, dashboard et réconciliation.

Le MVP exclut la création massive de comptes TikTok, le warm-up artificiel, l’achat de Coins, la saisie de paiements, le scraping, la simulation de navigateur, la garantie d’éligibilité Promote, le transfert de fonds entre clients, l’activation automatique à dépense réelle et tout contournement de restriction.

**Verdict de périmètre : GO SOUS CONDITIONS.** Le périmètre commercialisable est l’orchestration assistée avec intégrations officielles ; l’automatisation Promote reste explicitement hors périmètre.

## 2. Architecture cible

```text
Utilisateur
    |
Next.js / TypeScript / Tailwind
    |
NestJS API
    |-- tenant guard + RBAC + approval policy
    |-- Developer OAuth adapter
    |-- Business OAuth adapter
    |-- ContentPostingAdapter
    |-- MarketingApiAdapter
    `-- PromoteManualWorkflow
    |
    +-- PostgreSQL/Prisma : source de vérité
    +-- Transactional Outbox -> Redis/BullMQ : jobs fiables
    +-- Stockage objet S3 : médias et preuves
    +-- KMS/secret manager : tokens et secrets
    `-- Socket.IO : notifications seulement
```

Stack : Next.js, TypeScript, Tailwind CSS, NestJS, PostgreSQL, Prisma, Redis, BullMQ, Socket.IO, Docker, Jest, Playwright, stockage objet S3-compatible, secret manager/KMS et observabilité.

### 2.1 Sécurité et multi-tenant

`tenant_id` est obligatoire sur les données métier, fichiers, rapports, jobs, webhooks et audits. `organization_id` est la racine métier et doit correspondre au tenant. `client_id` est contrôlé par clé étrangère composite ou trigger de cohérence.

Les contrôles ne reposent pas uniquement sur les filtres Prisma :

- PostgreSQL Row Level Security est **À TESTER** puis recommandé pour les tables métier sensibles ;
- le rôle applicatif n’a pas le privilège `BYPASSRLS` et les tables sensibles utilisent `FORCE ROW LEVEL SECURITY` lorsque cela est approprié ;
- chaque transaction définit `SET LOCAL app.tenant_id = ...` et, si nécessaire, `SET LOCAL app.client_id = ...` avant les requêtes protégées ; le contexte est automatiquement nettoyé à la fin de la transaction ;
- avec Prisma et les connexions poolées, les requêtes RLS sont exécutées dans une transaction Prisma unique qui initialise le contexte ; aucune connexion hors transaction ne doit réutiliser un contexte tenant ;
- les tests couvrent plusieurs tenants simultanés, plusieurs connexions du pool et des transactions concurrentes ;
- le backend NestJS vérifie aussi le tenant, client et `advertiser_id` ;
- les accès directs au stockage objet utilisent des clés préfixées par tenant/client et des URLs signées ;
- les queues et événements portent leur tenant et sont rejetés si la relation est incohérente ;
- les exports, notifications et journaux sont filtrés par tenant ;
- les tests vérifient l’accès transversal par SQL, API, job et fichier.

Les tokens, mots de passe, cookies, `client_secret`, données bancaires, carte et CVV ne sont jamais envoyés au frontend ni stockés en clair. Aucun secret de session TikTok n’est utilisé pour contourner une API.

### 2.2 Jobs et source de vérité

PostgreSQL est la source de vérité. Une transaction métier écrit l’état et une ligne `OutboxEvent` dans la même transaction. Un dispatcher lit l’outbox et publie vers BullMQ avec une clé d’idempotence. Après publication, l’événement est marqué `PUBLISHED`; les erreurs restent rejouables.

Les jobs ont un statut, un nombre de tentatives, un backoff borné, une dead-letter queue, une corrélation et un tenant. Après panne Redis, le dispatcher republie les événements non marqués publiés. Le consommateur effectue une déduplication avant mutation. Socket.IO diffuse seulement un état déjà écrit en base.

## 3. OAuth et connexions TikTok

### 3.1 Developer OAuth — Content Posting

**Statut : À TESTER.**

Application sur `developers.tiktok.com`, Login Kit/Content Posting activés, redirect URI HTTPS statique et scopes approuvés. L’utilisateur TikTok consent aux scopes nécessaires : `user.info.basic` et `video.upload` ou `video.publish` selon le parcours.

Le serveur génère un `state`, reçoit le code, échange côté serveur contre `access_token` et `refresh_token`, chiffre les deux références, conserve `open_id`, scopes et expirations, puis renouvelle selon `expires_in` et `refresh_expires_in`. La documentation consultée indique 2 heures pour l’access token et 180 jours pour le refresh token ; ces durées sont **À TESTER** dans le compte pilote et ne doivent pas être codées en dur. La rotation remplace le refresh token précédent.

Révocation : `POST https://open.tiktokapis.com/v2/oauth/revoke/`, puis purge des secrets et suspension des jobs. Un callback expiré, rejoué, altéré ou adressé à un autre client est rejeté.

### 3.2 Business OAuth — Marketing API

**Statut : À TESTER.**

Application TikTok for Business, permissions Marketing API, Advertiser Authorization URL et autorisation explicite de l’annonceur. L’annonceur vérifie son identité ; NestJS échange l’`auth_code` côté serveur via le endpoint courant `/oauth2/access_token/`. L’`auth_code` est à usage unique et temporaire.

Le token Business est associé à `product=BUSINESS`, aux permissions et aux comptes accessibles. Le cycle exact de refresh/révocation doit être vérifié dans le portail Business. La documentation de versioning indique que `/oauth2/refresh_token/` est déprécié et que des tokens long terme sont fournis : M2L ne doit pas appliquer le refresh Developer au token Business.

Une connexion Developer ne donne pas accès à Ads Manager ; une connexion Business ne donne pas accès à Content Posting. Les deux lignes `TikTokConnection` sont indépendantes et une association éventuelle est auditée.

### 3.3 `OAuthState`

`OAuthState(id, organization_id, client_id, initiated_by_user_id, connection_product, state_hash, redirect_uri, expires_at, consumed_at, created_at)`.

Le callback est accepté uniquement si :

1. le hash du `state` correspond ;
2. `expires_at` n’est pas dépassé ;
3. `consumed_at` est nul ;
4. `redirect_uri` et `connection_product` correspondent ;
5. l’utilisateur initiateur a toujours accès à `organization_id` et `client_id` ;
6. le produit et le client de la réponse correspondent à la demande.

Après succès ou échec final, l’état est consommé. Un replay retourne une erreur sans échanger le code.

## 4. Modèle de données consolidé

### 4.1 Relations

```text
Organization/tenant
  └── Client
       ├── TikTokConnection(DEVELOPER) ── TikTokProfile ── ContentItem ── PublishAttempt
       ├── TikTokConnection(BUSINESS) ── AdvertiserAccount ── Campaign ── AdGroup ── Ad
       └── PromoteLink(profile, advertiser) ── PromoteOrder ── PromoteMetricSnapshot
```

### 4.2 Entités obligatoires

- `Organization(id, tenant_id, name, status)` ;
- `Client(id, tenant_id, organization_id, legal_name, timezone, status)` ;
- `User(id, email, status, mfa_enabled)` ;
- `Membership(id, tenant_id, organization_id, user_id, role)` ;
- `ClientAccess(id, tenant_id, client_id, user_id, role)` ;
- `TikTokConnection(id, tenant_id, client_id, product, provider, external_subject, encrypted_access_token_ref, encrypted_refresh_token_ref, scopes_or_permissions, issued_at, expires_at, refresh_expires_at, verification_status, last_verified_at, evidence_ref, source_observed_at, status)` ;
- `OAuthState` tel que défini en section 3.3 ;
- `TikTokProfile(id, tenant_id, client_id, connection_id, open_id, username, verification_status, last_verified_at, evidence_ref, source_observed_at, status)` ;
- `AdvertiserAccount(id, tenant_id, client_id, connection_id, advertiser_id, business_center_id, currency, timezone, verification_status, last_verified_at, evidence_ref, source_observed_at, status)` ;
- `MediaAsset(id, tenant_id, client_id, object_key, checksum, type, rights_status, verification_status, evidence_ref, source_observed_at, retention_until)` ;
- `ContentItem(id, tenant_id, client_id, media_asset_id, caption, approval_status, planned_at)` ;
- `PublishAttempt(id, tenant_id, content_id, profile_id, mode, scope, publish_id, status, failure_reason, source_observed_at, evidence_ref)` ;
- `Campaign(id, tenant_id, advertiser_account_id, external_id, origin, origin_confidence, status, source_observed_at, synced_at)` ;
- `AdGroup(id, tenant_id, campaign_id, external_id, budget, schedule_json, status)` ;
- `Ad(id, tenant_id, ad_group_id, external_id, creative_id, status)` ;
- `PromoteLink(id, tenant_id, client_id, profile_id, advertiser_account_id, verification_status, last_verified_at, eligibility_source, evidence_ref, source_observed_at, status, region, platform)` ;
- `PromoteOrder(id, tenant_id, promote_link_id, external_order_id, external_campaign_id, origin_confidence, budget, currency, start_at, end_at, status, source, source_observed_at)` ;
- `PromoteMetricSnapshot(id, tenant_id, promote_order_id, source, period_start, period_end, metrics_json, source_observed_at, verification_status, evidence_ref)` ;
- `AccountFundBoundary(id, tenant_id, client_id, advertiser_account_id, promote_link_id, fund_type, currency, observed_balance, observation_status, source, source_observed_at, evidence_ref, verification_status, last_verified_at)` ;
- `ReconciliationCase(id, tenant_id, client_id, entity_type, entity_id, local_value_json, external_value_json, source, source_observed_at, difference_type, status, assigned_to, evidence_ref, resolved_at)` ;
- `ApprovalRequest(id, tenant_id, client_id, action, target_type, target_id, amount, currency, budget, period_start, period_end, target_account_ref, operation_params_snapshot, requested_by, approved_by, approved_at, expires_at, external_operation_ref, status)` ;
- `WebhookEvent(id, tenant_id, provider, connection_id, external_event_id, event_type, payload_hash, received_at, source_observed_at, processed_at, processing_status, attempt_count, evidence_ref)` ;
- `OutboxEvent(id, tenant_id, aggregate_type, aggregate_id, event_type, payload_json, idempotency_key, created_at, published_at, attempts, status)` ;
- `Job(id, tenant_id, queue, idempotency_key, status, attempts, next_attempt_at, correlation_id)` ;
- `AuditLog(id, tenant_id, organization_id, actor_id, action, target, before_json, after_json, source, source_observed_at, evidence_ref, correlation_id, created_at)`.

### 4.3 Contraintes

- `tenant_id` est obligatoire sur toutes les tables métier, fichiers, rapports, jobs, webhooks, outbox et audits ;
- les clés étrangères composites incluent `tenant_id` lorsque la base le permet ; à défaut, triggers/contraintes et vérification de service garantissent la cohérence ;
- PostgreSQL RLS est **À TESTER** sur un environnement pilote, avec `FORCE ROW LEVEL SECURITY` pour les tables sensibles ;
- `PromoteLink` ne relie que des objets du même tenant et client ;
- les objets externes ne sont jamais identifiés par nom seul ;
- `verification_status`, `last_verified_at`, `evidence_ref` et `source_observed_at` sont obligatoires pour toute observation externe sensible ;
- `observed_balance` n’est jamais présenté comme temps réel : son affichage indique source et date d’observation ;
- `WebhookEvent` est dédupliqué par `(provider, connection_id, external_event_id)` lorsqu’il existe, sinon par hash/payload et date observée ;
- aucun token en clair, mot de passe, cookie, carte, CVV ou compte bancaire.

### 4.4 Approbations financières

`ApprovalRequest` conserve un snapshot immuable des paramètres approuvés : montant, devise, budget, période, compte cible, paramètres complets, approbateur, date d’approbation, expiration et référence externe après exécution.

Une modification de montant, devise, budget, période, compte, objectif ou paramètre sensible invalide l’approbation et crée une nouvelle demande. Le snapshot ne peut pas être modifié après approbation.

### 4.5 Webhooks

Les webhooks sont reçus via HTTPS, rattachés à `connection_id` et `tenant_id`, hashés, conservés dans `WebhookEvent`, puis traités par BullMQ. Les événements peuvent arriver dans le désordre : le consumer applique des transitions monotones ou une réconciliation avant de conclure. Les événements inconnus restent `UNSUPPORTED`/`IGNORED`.

L’authenticité est vérifiée selon le mécanisme officiellement documenté pour le produit. Si TikTok ne documente pas de signature pour un événement donné, M2L ne doit pas inventer une vérification de signature ; il applique HTTPS, contrôle de schéma, allowlist documentée si disponible, déduplication, anti-replay et corrélation avec une opération attendue.

## 5. Rôles et workflows

Rôles : Administrateur M2L, Administrateur/gestionnaire client à préciser, Opérateur VA, Approbateur financier et Lecteur. La portée est toujours tenant → client → connexion → compte.

### Publication

- `video.upload` : `POST /v2/post/publish/inbox/video/init/`, scope `video.upload`, transfert fichier ou URL vérifiée, puis action de l’utilisateur dans TikTok ; ce n’est pas une publication directe.
- `video.publish` : `POST /v2/post/publish/creator_info/query/`, puis `POST /v2/post/publish/video/init/`, scope `video.publish`, consentement et options retournées par TikTok ; client non audité limité au privé.
- `POST /v2/post/publish/status/fetch/` et webhooks suivent les deux modes.

### Promote

Tâche VA → preuve d’éligibilité observée → approbation financière distincte → exécution manuelle dans TikTok/Ads Manager → résultat et preuve enregistrés. Coins, Promote Balance et Ads Manager Balance ne sont jamais fusionnés. L’intégration Promote ↔ Ads Manager est une capacité d’interface documentée sous conditions, pas une preuve de Marketing API.

### 5.1 États de publication et reprise

M2L distingue l’état de son opération locale de l’état TikTok observé :

`UPLOAD_INITIALIZED` → `UPLOADING` → `UPLOADED` → `PENDING_CREATOR_ACTION` → `PUBLISHING` → `PUBLISHED`.

À tout moment, une opération peut terminer en `FAILED` ou `EXPIRED`.

- `UPLOAD_INITIALIZED` : TikTok a fourni un `publish_id` et, pour `FILE_UPLOAD`, une `upload_url` ; rien n’est encore publié.
- `UPLOADING` : transfert du fichier en cours.
- `UPLOADED` : transfert accepté/terminé côté transfert, sans preuve que le contenu est publié.
- `PENDING_CREATOR_ACTION` : le flux `video.upload` a livré une notification inbox et attend l’édition/publication de l’utilisateur.
- `PUBLISHING` : Direct Post ou finalisation utilisateur est en traitement/modération.
- `PUBLISHED` : TikTok a retourné `PUBLISH_COMPLETE`; la disponibilité publique est suivie séparément par `post.publish.publicly_available` et la modération.
- `FAILED` : échec définitif ou non récupérable selon `fail_reason`.
- `EXPIRED` : URL de transfert expirée ou fenêtre d’exécution dépassée ; cet état ne signifie pas publication.

En cas d’URL expirée ou d’upload interrompu, M2L conserve l’historique, marque la tentative `EXPIRED`/`FAILED`, crée une nouvelle initialisation contrôlée si l’utilisateur l’autorise et utilise une nouvelle clé d’idempotence de tentative. Aucun retry automatique ne doit créer une double publication. Une reprise ne réutilise pas une `upload_url` expirée.

## 6. Intégrations et limites

### 6.1 Content Posting API

| Endpoint | Scope | Limite documentée | Statut |
|---|---|---|---|
| `POST /v2/post/publish/inbox/video/init/` | `video.upload` | 6 req/min/access token ; maximum 5 partages en attente/24 h par utilisateur ; `upload_url` valable 1 h | **À TESTER** |
| `POST /v2/post/publish/video/init/` | `video.publish` | 6 req/min/access token ; plafonds quotidiens TikTok non chiffrés ici | **À TESTER** |
| `POST /v2/post/publish/creator_info/query/` | `video.publish` | 20 req/min/access token | **À TESTER** |
| `POST /v2/post/publish/status/fetch/` | `video.upload`/`video.publish` | 30 req/min/access token | **CONFIRMÉ PAR DOCUMENTATION** |
| `PUT upload_url` | réponse init | chunks et URL temporaire ; limites média documentées | **À TESTER** |
| `post.publish.*` | configuration app | webhook à vérifier sur app pilote | **À TESTER** |

Ces limites sont centralisées dans une configuration versionnée, avec source, date de vérification, endpoint, scope et valeur. Le code ne doit pas disperser de constantes non sourcées.

### 6.2 Marketing API — lecture seule dans le MVP

Les versions ne sont pas uniformisées par hypothèse. La documentation de versioning consultée décrit une famille v1.3 pour les capacités actuellement documentées, mais chaque endpoint est confirmé séparément dans le portail au moment de l’implémentation.

| Capacité | Endpoint à examiner | Statut |
|---|---|---|
| échange Business | `/oauth2/access_token/` courant | **À TESTER** |
| lecture campagnes | endpoints de lecture exposés par la famille courante | **À TESTER** |
| lecture ad groups | endpoints de lecture exposés par la famille courante | **À TESTER** |
| lecture ads | endpoints de lecture exposés par la famille courante | **À TESTER** |
| rapport synchrone | `/report/integrated/get/` — famille v1.3 documentée | **À TESTER** |
| rapport asynchrone | `/report/task/create/` — famille v1.3 documentée | **À TESTER** |
| anciens rapports | `/reports/integrated/get/`, `/reports/ad/get/`, etc. | **HORS MVP** |
| création/modification campagnes | `/campaign/create/`, `/campaign/update/` mentionnés en v1.3 | **HORS MVP** |
| création/modification ad groups | `/adgroup/create/`, `/adgroup/update/` mentionnés en v1.3 | **HORS MVP** |
| création/modification ads | `/ad/create/`, `/ad/update/` mentionnés en v1.3 | **HORS MVP** |
| order Promote dédié | aucun endpoint public identifié | **HORS MVP** |

Les scopes/permissions exacts et la disponibilité par compte sont **À TESTER**. Les anciennes formes `/reports/...` sont historiques ou dépréciées selon le bulletin de versioning ; elles ne doivent pas être utilisées sans confirmation explicite du portail. Les endpoints d’écriture sont réservés à une phase ultérieure, avec nouvelle décision produit, validation des permissions et critères financiers dédiés.

### 6.3 Promote

Promote est **MANUEL**. TikTok documente la liaison, l’affichage de budget/période/performance dans Ads Manager et l’utilisation possible du solde Ads Manager après intégration, sous conditions. TikTok ne documente pas ici d’endpoint public pour créer, pauser, arrêter, financer ou reporter un order Promote via Marketing API. M2L n’invente aucun adaptateur Promote API.

## 7. Sécurité, conformité et risques

- OAuth et secrets uniquement côté serveur ;
- RLS, clés composites ou contrôles équivalents en plus de Prisma ;
- stockage objet isolé par tenant et client ;
- audit immuable et preuves datées ;
- outbox pour éviter perte ou double publication de jobs ;
- idempotence et approbations immuables contre les doubles dépenses ;
- 401/403 suspendent ou demandent réautorisation, 429 appliquent backoff, 5xx sont retryés bornés puis dead-letter ;
- aucune automatisation de comptes, warm-up, paiements, Coins ou contournement ;
- tout risque de suspension, modération, quota ou dépréciation TikTok reste une dépendance externe.

## 8. Tests et critères d’acceptation

### 8.1 Fonctionnels obligatoires du pilote

- **A01** connexion Developer, token chiffré, scopes et profil sélectionné ;
- **A02** `video.upload`, notification inbox et `publish_id`, sans déclarer la vidéo publiée ;
- **A03** `video.publish`, creator info, consentement et statut ;
- **A04** status fetch/webhook et déduplication ;
- **A05** connexion Business et `advertiser_id` rattaché au bon client ;
- **A06** reporting Ads Manager et rapprochement période/fuseau/métriques ;
- **A07** tâche VA Promote, preuve, approbation financière distincte, exécution manuelle, résultat et traçabilité complète ;
- **A08** présence Promote dans API : `VALIDÉ` uniquement si trouvée et rapprochée ; `NON DISPONIBLE` est accepté avec preuve de vérification et explication ;
- **A09** aucune donnée bancaire dans M2L ;
- **A10** callback OAuth rejoué, expiré ou destiné au mauvais client rejeté ;
- **A11** révocation pendant un job : job bloqué, secrets purgés et reconnexion requise ;
- **A12** upload interrompu/URL expirée : reprise contrôlée ou échec explicite, sans double publication ;
- **A13** approbation expirée ou paramètre modifié : exécution refusée et nouvelle approbation requise ;
- **A14** panne Redis après transaction PostgreSQL : outbox republiable, aucune perte ni double exécution ;
- **A15** webhook dupliqué, invalide ou désordonné : rejet/déduplication/réconciliation ;
- **A16** accès à média/rapport d’un autre tenant : refus et événement d’audit.

### 8.2 Critères de réussite

Le premier pilote est accepté si A01–A07, sécurité, isolation, fiabilité des jobs/webhooks et absence de données bancaires interdites passent avec preuves. A08 peut être `NON DISPONIBLE` si la recherche est documentée, si le reporting alternatif Promote est défini avec sa provenance (`PROMOTE_UI`/`MANUAL`) et si A07 est validé. A09–A16 restent obligatoires lorsque leur domaine est activé dans le pilote. L’absence d’exposition API Promote ne constitue pas un échec produit. Les simulations 10, 50 et 200 comptes sont une validation de capacité progressive après le pilote.

## 9. Roadmap

1. **Phase 0 — accès et décisions :** marchés, comptes pilotes, rôles, apps, scopes, domaines, politique et plafonds.
2. **Phase 1 — socle :** tenant, RLS/contrôles, OAuth séparés, secrets, audit, outbox, Docker et observabilité.
3. **Phase 2 — Content Posting :** `video.upload`, `video.publish`, status, webhooks, quotas et consentement.
4. **Phase 3 — Marketing API lecture :** autorisation Business, annonceur, campagnes et reporting confirmés.
5. **Phase 4 — Promote manuel :** tâches VA, preuves, approbations, liaison et rapprochement.
6. **Phase 5 — durcissement :** sécurité, isolation, charge progressive, reprise, runbooks et déploiement limité.
7. **Phase 6 — extension :** décider séparément l’écriture Ads Manager et toute capacité Promote seulement après preuve.

Le passage de phase dépend des tests, autorisations TikTok, comptes pilotes et décisions client. Aucun SLA ne couvre les délais d’audit ou de revue TikTok.

## 10. Sources officielles et date de vérification

- [Login Kit OAuth](https://developers.tiktok.com/docs/en/login-kit-overview)
- [Manage Developer access tokens](https://developers.tiktok.com/docs/en/oauth-user-access-token-management)
- [Revoke Developer token](https://developers.tiktok.com/docs/en/oauth-revoke-a-user-access-token)
- [Scopes Developer](https://developers.tiktok.com/docs/en/scopes-overview)
- [Content Posting Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post)
- [Query Creator Info](https://developers.tiktok.com/docs/en/content-posting-api-reference-query-creator-info)
- [Content Posting Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video)
- [Content Posting Status/Webhooks](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status)
- [Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines)
- [Marketing API portal](https://ads.tiktok.com/gateway/docs/index)
- [Business authorization](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378)
- [API for Business](https://ads.tiktok.com/resources/help/article/marketing-api?lang=en)
- [Marketing API versioning/reporting](https://ads.tiktok.com/gateway/docs/index?doc_id=1740579480076290)
- [Promote integration](https://ads.tiktok.com/resources/help/article/about-promote-integration-with-tiktok-ads-manager?lang=en)
- [Promote integration steps](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager)
- [Promote payment methods](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en)

## 11. Décisions ouvertes bloquantes

- rôle « Gestionnaire » : rôle distinct ou alias de l’administrateur client ;
- marché, devises, plateformes et comptes pilotes ;
- scopes et permissions effectivement approuvés ;
- cycle de vie réel du token Business dans le portail ;
- activation PostgreSQL RLS et stratégie de clés étrangères composites ;
- mécanisme d’authenticité webhook officiellement disponible par produit ;
- cardinalité Promote ↔ Ads Manager ;
- présence et provenance des Promote orders dans les rapports Marketing API ;
- seuils de budget, double approbation et conservation des preuves ;
- critères de passage de capacité à 10/50/200 comptes.

**Maturité :** suffisamment précise pour lancer la phase 0 et le pilote documentaire/technique ; pas encore prête pour une généralisation multi-comptes ou une promesse d’automatisation Promote.
