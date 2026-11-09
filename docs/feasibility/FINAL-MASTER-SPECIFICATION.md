# M2L TikTok Ads Operations — spécification maître du MVP

**Version :** 1.0  
**Date de consolidation :** 9 novembre 2026  
**Nature :** document de référence fonctionnel et technique, sans développement inclus.

## Convention de statut

Chaque capacité est qualifiée par un statut unique :

- **CONFIRMÉ PAR DOCUMENTATION** : capacité décrite par une source officielle ou une règle interne définitivement adoptée ;
- **À TESTER** : capacité dépendante d’un compte, d’un marché, d’un scope, d’un audit ou d’un comportement non démontré ;
- **MANUEL** : action exécutée par un utilisateur habilité dans TikTok ou Ads Manager ;
- **HORS MVP** : capacité explicitement exclue du périmètre initial.

Les formulations « confirmé interface » des documents sources sont conservées comme **CONFIRMÉ PAR DOCUMENTATION**, avec la précision qu’elles ne constituent pas une preuve de disponibilité dans une API.

---

## 1. Présentation générale du projet

### 1.1 Problème à résoudre

M2L TikTok Ads Operations est une plateforme interne destinée à centraliser les opérations TikTok d’une agence : plusieurs clients, profils TikTok, comptes annonceurs, contenus, tâches VA, validations, campagnes et indicateurs. Aujourd’hui, les opérations sont dispersées entre TikTok, TikTok Ads Manager, Promote, tableurs et échanges humains, ce qui augmente les risques de mauvais compte, de double dépense, de perte de traçabilité et de divergence des KPI.

Le projet doit traiter trois domaines qui ne sont pas interchangeables :

1. **Content Posting API** : publication organique sur un profil TikTok autorisé ;
2. **TikTok Ads Manager Marketing API** : gestion et reporting des actifs publicitaires exposés par TikTok for Business ;
3. **TikTok Promote** : parcours de promotion depuis TikTok, conservé comme workflow manuel tant que son exposition par Marketing API n’est pas prouvée.

### 1.2 Objectifs

- centraliser les comptes et autorisations sans mélanger les clients ;
- préparer, valider et suivre les vidéos ;
- distinguer explicitement upload, publication, campagne et promotion ;
- synchroniser les ressources et rapports Ads Manager confirmés ;
- orchestrer les tâches manuelles Promote et VA ;
- imposer des validations humaines avant écriture ou dépense ;
- conserver un audit exploitable de chaque opération ;
- préparer une montée en charge vers plusieurs dizaines ou centaines de comptes, sous réserve des limites TikTok.

### 1.3 Utilisateurs cibles

- administrateurs M2L ;
- administrateurs ou gestionnaires côté client ;
- opérateurs VA ;
- approbateurs financiers ;
- lecteurs et analystes.

### 1.4 Proposition de valeur

M2L ne remplace pas TikTok. La valeur est une couche de contrôle opérationnel : elle associe le bon utilisateur au bon client et au bon compte, guide les actions autorisées, automatise les synchronisations documentées, empêche les opérations financières non approuvées et expose l’origine réelle de chaque donnée.

---

## 2. Périmètre fonctionnel

### 2.1 Fonctionnalités du MVP

| Fonctionnalité | Statut | Règle de périmètre |
|---|---|---|
| Organisations, clients, utilisateurs et RBAC | **CONFIRMÉ PAR DOCUMENTATION** | modèle interne obligatoire |
| Connexions OAuth Developer/Business | **À TESTER** | autorisation et scopes réels requis |
| Profils TikTok autorisés | **À TESTER** | uniquement après connexion consentie |
| Comptes annonceurs autorisés | **À TESTER** | sélection explicite de l’`advertiser_id` |
| Préparation et approbation de contenu | **CONFIRMÉ PAR DOCUMENTATION** | workflow interne |
| Upload vidéo `video.upload` | **À TESTER** | upload inbox, puis action utilisateur dans TikTok |
| Direct Post `video.publish` | **À TESTER** | scope, consentement, audit et contraintes de visibilité |
| Status fetch et webhooks Content Posting | **À TESTER** | idempotence et endpoint HTTPS |
| Synchronisation Ads Manager en lecture | **À TESTER** | endpoint et permission par compte |
| Reporting Marketing API | **À TESTER** | réconciliation avec Ads Manager |
| Workflow Promote avec VA | **MANUEL** | aucune automatisation API non documentée |
| Preuves et rapprochement Promote | **MANUEL** | source UI, saisie opérateur ou API si prouvée |
| Dashboard, alertes et audit | **CONFIRMÉ PAR DOCUMENTATION** | fonctionnalités M2L internes |

### 2.2 Fonctionnalités futures

- écriture Marketing API après validation de chaque endpoint et garde-fous ;
- extension du nombre de profils et comptes après test de quotas ;
- éventuelle automatisation d’un endpoint Promote uniquement si TikTok le documente et l’autorise ;
- reporting Promote API si sa présence dans les rapports est démontrée ;
- optimisation budgétaire assistée, jamais autonome sans nouvelle décision ;
- intégrations supplémentaires après validation juridique et sécurité.

### 2.3 Fonctionnalités exclues

- création automatisée de comptes TikTok ;
- warm-up, simulation d’activité ou contournement de restrictions ;
- achat de Coins et saisie de moyens de paiement ;
- stockage de cartes, CVV, comptes bancaires, mots de passe ou cookies ;
- scraping et browser automation ;
- garantie d’éligibilité Promote ;
- transfert de fonds entre clients ;
- activation automatique à dépense réelle dans le MVP ;
- gestion d’un compte non autorisé.

### 2.4 Limites connues

- TikTok peut refuser ou retarder les audits et autorisations ;
- la disponibilité des fonctionnalités varie selon pays, type de compte, plateforme, devise et statut ;
- l’interface Ads Manager ne prouve pas la disponibilité dans Marketing API ;
- Coins, Promote balance et Ads Manager balance restent distincts ;
- les métriques peuvent différer selon fuseau, attribution, devise et délai de consolidation ;
- les quotas TikTok et les limites d’attente empêchent de promettre une capacité basée seulement sur l’infrastructure M2L.

---

## 3. Architecture technique complète

### 3.0 Séparation obligatoire des connexions OAuth

M2L conserve deux connexions OAuth indépendantes. Elles ne partagent ni application, ni token, ni scopes, ni cycle de renouvellement.

| Connexion | Produit TikTok | Objet autorisé | Cycle de vie | Statut |
|---|---|---|---|---|
| `DEVELOPER` | TikTok for Developers / Login Kit | profil TikTok et Content Posting | user access token + refresh token ; renouvellement et révocation Developer indépendants | **À TESTER** |
| `BUSINESS` | TikTok for Business / Marketing API | compte annonceur et Ads Manager | token Business issu de l’autorisation annonceur ; cycle Business indépendant | **À TESTER** |

#### Developer OAuth

M2L enregistre une application sur `developers.tiktok.com`, configure Login Kit/Content Posting, génère un `state` et redirige vers TikTok via HTTPS. L’utilisateur consent aux scopes approuvés, notamment `user.info.basic` et, selon le parcours, `video.upload` ou `video.publish`. NestJS échange le code côté serveur contre `access_token` et `refresh_token`, stocke les valeurs chiffrées avec `open_id`, scopes et expirations, puis renouvelle avant expiration. Le refresh token retourné lors d’une rotation remplace l’ancien. À la déconnexion, M2L révoque le token avec `POST https://open.tiktokapis.com/v2/oauth/revoke/`, purge les secrets et suspend les jobs.

Les durées doivent être lues dans `expires_in` et `refresh_expires_in`, jamais codées en dur. La documentation actuelle indique 2 heures pour l’access token et 180 jours pour le refresh token ; ces valeurs restent à confirmer dans l’environnement réel.

#### Business OAuth

M2L enregistre une application Marketing API, sélectionne les permissions Business, puis transmet l’Advertiser Authorization URL au client. L’annonceur autorise l’application et vérifie son identité. NestJS reçoit l’`auth_code` et l’échange côté serveur via le endpoint courant `/oauth2/access_token/` avec l’app ID et le secret Business. M2L découvre les comptes accessibles et associe explicitement chaque `advertiser_id` au client. Une révocation, perte de permission ou expiration suspend les jobs et impose une nouvelle autorisation Business.

L’`auth_code` Business est à usage unique et temporaire. La documentation de versioning indique que `/oauth2/refresh_token/` est déprécié, car des tokens long terme sont fournis ; le cycle exact de renouvellement/révocation Business doit donc être vérifié dans le portail courant et ne doit pas être assimilé au refresh Developer.

**Règle non négociable :** une connexion Developer ne donne pas accès à Ads Manager et une connexion Business ne donne pas accès au profil Content Posting. Toute corrélation entre les deux est explicite, sélectionnée et auditée.

Sources : [Login Kit OAuth](https://developers.tiktok.com/docs/en/login-kit-overview), [Manage Developer access tokens](https://developers.tiktok.com/docs/en/oauth-user-access-token-management), [Revoke Developer token](https://developers.tiktok.com/docs/en/oauth-revoke-a-user-access-token), [Business authorization](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378).

### 3.1 Stack

- **Frontend :** Next.js, TypeScript, Tailwind CSS ;
- **Backend :** NestJS, TypeScript ;
- **Données :** PostgreSQL, Prisma ;
- **Asynchrone :** Redis, BullMQ ;
- **Temps réel :** Socket.IO pour progression et notifications ;
- **Tests :** Jest, tests d’intégration, Playwright ;
- **Infrastructure :** Docker, environnements séparés ;
- **Médias :** stockage objet S3-compatible ;
- **Secrets :** KMS ou secret manager ;
- **Observabilité :** logs structurés, métriques, traces et alertes.

Tous ces choix portent le statut principal **CONFIRMÉ PAR DOCUMENTATION** au sens de choix internes cohérents avec le besoin ; leur dimensionnement réel est une validation séparée **À TESTER**.

### 3.2 Architecture applicative

```text
Utilisateur
    |
    v
Next.js / Tailwind
    |
    v
NestJS API
    |-- tenant guard / RBAC / approval policy
    |-- OAuth callbacks serveur
    |-- ContentPostingAdapter
    |-- MarketingApiAdapter
    `-- PromoteManualWorkflow
    |
    +--> PostgreSQL / Prisma : état, snapshots, audit
    +--> Redis / BullMQ : jobs, retries, polling, rapports
    +--> Stockage objet : médias et justificatifs
    `--> Socket.IO : notifications d’état
```

Le frontend ne reçoit jamais de `client_secret`, access token, cookie ou credential fournisseur. Les callbacks OAuth et appels TikTok sont exécutés côté serveur.

### 3.3 Modules backend

1. **Identity & Tenant** : organisations, clients, utilisateurs, sessions, RBAC ;
2. **OAuth & Connections** : états OAuth, tokens chiffrés, scopes, révocation ;
3. **Profiles** : profils TikTok et données de connexion ;
4. **Content & Media** : médias, droits, validation, calendrier ;
5. **Content Posting** : upload, Direct Post, status, webhooks ;
6. **Advertiser Accounts** : `advertiser_id`, Business Center, rôles et limites ;
7. **Marketing Operations** : campagnes, ad groups, ads, créations et rapports ;
8. **Promote Manual Workflow** : liaison, tâches VA, preuves, statuts et rapprochement ;
9. **Approvals & Finance Boundary** : approbations, plafonds, kill switch, sans paiement ;
10. **Audit & Compliance** : journal, rétention, incidents ;
11. **Jobs & Observability** : queues, dead-letter, métriques, corrélation TikTok.

### 3.4 Communication et tâches asynchrones

Les opérations lentes ou répétables passent par BullMQ : synchronisation paginée, rapport asynchrone, polling de statut, traitement de webhook, réconciliation, notification et nettoyage. Chaque job porte `tenant_id`, cible, clé d’idempotence, nombre de tentatives et corrélation.

Les retries sont limités et utilisent backoff. Les erreurs 401/403 ne sont pas réessayées indéfiniment ; elles suspendent la connexion et demandent une reconnexion. Les 429 respectent le délai de reprise. Les erreurs 5xx sont réessayées puis placées en dead-letter queue.

Socket.IO diffuse une progression, mais ne constitue pas la vérité métier : l’état persistant est lu dans PostgreSQL.

### 3.5 Sécurité et isolation multi-tenant

- chaque requête et job est contrôlé par tenant ;
- l’accès est borné par client et `advertiser_id`, jamais par nom seulement ;
- les tokens sont chiffrés au repos et redacted dans les logs ;
- OAuth `state` est à usage unique, court et lié au redirect URI ;
- les URLs médias sont vérifiées et protégées contre SSRF ;
- les médias et justificatifs ont une rétention définie ;
- les écritures et dépenses exigent une approbation valide ;
- les budgets ont des plafonds et un kill switch ;
- un tenant ne peut lire les fichiers, rapports, jobs, notifications ou audits d’un autre tenant.

---

## 4. Modèle de données

### 4.1 Hiérarchie

```text
Organization
  └── Client
       ├── TikTokConnection (Developer ou Business)
       ├── TikTokProfile
       │    └── ContentItem → PublishAttempt
       ├── AdvertiserAccount
       │    └── Campaign → AdGroup → Ad
       └── PromoteLink → PromoteOrder → PromoteMetricSnapshot
```

### 4.2 Entités et champs importants

- `Organization(id, name, status)` : tenant racine M2L ;
- `Client(id, organization_id, legal_name, timezone, status)` : périmètre client et contexte de reporting ;
- `User(id, email, status, mfa_enabled)` ;
- `Membership(id, organization_id, user_id, role)` et `ClientAccess(id, client_id, user_id, role)` ;
- `TikTokConnection(id, tenant_id, client_id, product, provider, external_subject, encrypted_access_token_ref, encrypted_refresh_token_ref, scopes_or_permissions, issued_at, expires_at, refresh_expires_at, verification_status, last_verified_at, evidence_ref, source_observed_at, status)` ;
- `OAuthState(id, product, state_hash, redirect_uri, expires_at, consumed_at)` ;
- `TikTokProfile(id, client_id, connection_id, open_id, username, status)` ;
- `AdvertiserAccount(id, client_id, connection_id, advertiser_id, business_center_id, currency, timezone, status)` ;
- `MediaAsset(id, client_id, object_key, checksum, type, rights_status, retention_until)` ;
- `ContentItem(id, client_id, media_asset_id, caption, approval_status, planned_at)` ;
- `PublishAttempt(id, content_id, profile_id, mode, scope, publish_id, status, failure_reason, source)` ;
- `Campaign(id, advertiser_account_id, external_id, origin, status, synced_at)` ;
- `AdGroup(id, campaign_id, external_id, budget, schedule_json, status)` ;
- `Ad(id, ad_group_id, external_id, creative_id, status)` ;
- `PromoteLink(id, client_id, profile_id, advertiser_account_id, status, eligibility_source, observed_at, region, platform)` ;
- `PromoteOrder(id, promote_link_id, external_order_id, external_campaign_id, origin_confidence, budget, currency, start_at, end_at, status, source)` ;
- `PromoteMetricSnapshot(id, promote_order_id, source, period_start, period_end, metrics_json, observed_at)` ;
- `AccountFundBoundary(id, tenant_id, client_id, advertiser_account_id, promote_link_id, fund_type, currency, observed_balance, observation_status, source, source_observed_at, evidence_ref, verification_status, last_verified_at)` ;
- `ReconciliationCase(id, tenant_id, client_id, entity_type, entity_id, local_value_json, external_value_json, source, source_observed_at, difference_type, status, assigned_to, evidence_ref, resolved_at)` ;
- `WebhookEvent(id, tenant_id, provider, connection_id, external_event_id, event_type, payload_hash, received_at, source_observed_at, processed_at, processing_status, attempt_count, evidence_ref)` ;
- `ApprovalRequest(id, client_id, action, target_type, target_id, requested_by, approved_by, status, expires_at)` ;
- `ReportSnapshot(id, advertiser_account_id, level, dimensions_json, metrics_json, period, api_version, fetched_at)` ;
- `Job(id, tenant_id, queue, idempotency_key, status, attempts)` ;
- `AuditLog(id, tenant_id, organization_id, actor_id, action, target, before_json, after_json, source, source_observed_at, evidence_ref, correlation_id, created_at)`.

### 4.3 Contraintes d’intégrité

- `tenant_id` est obligatoire sur toute table métier, job, fichier, webhook et audit ; `organization_id` reste l’entité racine et doit correspondre au tenant ;
- `client_id` est obligatoire pour les données client et ne peut référencer qu’un tenant correspondant ;
- `advertiser_id` est unique dans son contexte fournisseur/tenant ;
- `open_id` et `external_subject` sont scoped par connexion ;
- `PromoteLink` ne relie que des objets du même client ;
- une commande n’est exécutable que si son approbation est valide et non expirée ;
- `PublishAttempt.mode` vaut explicitement `UPLOAD` ou `DIRECT_POST` ;
- aucune entité ne contient carte, CVV, compte bancaire, mot de passe, cookie ou token en clair ;
- `verification_status`, `last_verified_at`, `evidence_ref` et `source_observed_at` sont obligatoires pour les observations externes sensibles ;
- `AccountFundBoundary.observed_balance` est toujours une observation datée et sourcée, jamais un solde temps réel garanti ;
- `WebhookEvent` est dédupliqué par `(provider, external_event_id)` lorsque disponible, sinon par `(provider, payload_hash, event_type, source_observed_at)` ; un événement déjà `PROCESSED` ne déclenche aucune seconde mutation ;
- la suppression ou révocation d’une connexion bloque les jobs associés.

### 4.4 Traçabilité et provenance

`source = CONTENT_POSTING_API | MARKETING_API | PROMOTE_UI | ADS_MANAGER_UI | MANUAL`.

`origin = PROMOTE | ADS_MANAGER | UNKNOWN` et `origin_confidence = DOCUMENTED | PILOT_VERIFIED | MANUAL | UNKNOWN`.

Une campagne visible dans Ads Manager ne peut pas être classée Promote par déduction de son nom. Les snapshots portent leur période, fuseau, version d’API, source, `source_observed_at`, `verification_status` et date de collecte. Les soldes observés portent également le mode d’observation et un justificatif ; aucune vue M2L ne les étiquette « temps réel ».

### 4.5 Réception et déduplication des webhooks

Les webhooks Content Posting et éventuels webhooks Business entrent par HTTPS, sont associés à la connexion et au tenant, puis insérés de façon transactionnelle dans `WebhookEvent` avec hash et identifiant externe. Le traitement métier est asynchrone via BullMQ. Les événements inconnus sont conservés comme `IGNORED`/`UNSUPPORTED` et ne sont pas supprimés.

---

## 5. Rôles et permissions

La demande consolidée mentionne « administrateur, gestionnaire, opérateur/VA, client ». Les documents sources définissent précisément **Administrateur M2L**, **Administrateur client**, **Opérateur VA**, **Approbateur financier** et **Lecteur**. Pour éviter une décision implicite, « gestionnaire » est traité comme un rôle fonctionnel à confirmer, pouvant correspondre à l’administrateur client ou à un gestionnaire opérationnel distinct.

| Rôle | Portée | Permissions |
|---|---|---|
| Administrateur M2L | plateforme/organisation | créer tenants, gérer politiques, connexions, rôles, kill switch, audits ; pas de paiement client par défaut |
| Administrateur client | client | gérer utilisateurs et accès, comptes autorisés, contenus, approbations métier, rapports |
| Gestionnaire client | à confirmer | proposition : organiser comptes, contenus, tâches et validation opérationnelle sans gérer les secrets financiers |
| Opérateur / VA | clients assignés | préparer contenu, exécuter tâches manuelles, joindre preuves, suivre publication ; pas d’auto-approbation ni paiement |
| Approbateur financier | client/compte | approuver budget, activation et opération financière externe ; accès minimal nécessaire |
| Client / Lecteur | client | consulter dashboard, rapports et audit autorisé ; aucune écriture |

### 5.1 Règles d’autorisation

- une connexion n’accorde pas l’accès à tous les comptes ;
- la portée client et `advertiser_id` est toujours contrôlée ;
- un VA ne peut approuver sa propre action ;
- les paiements se font dans TikTok par l’utilisateur habilité ;
- l’administrateur M2L peut bloquer une opération, mais ne contourne pas les autorisations TikTok ;
- le rôle « gestionnaire client » et le périmètre exact du « client » nécessitent validation avant implémentation RBAC.

---

## 6. Workflows métier

### 6.1 Onboarding client

1. Créer `Organization` et `Client` ;
2. renseigner marché, devise, fuseau, politiques de rétention et plafonds ;
3. inviter les utilisateurs et assigner les rôles ;
4. recueillir la preuve de propriété/autorisation des comptes ;
5. sélectionner les comptes pilotes ;
6. ne rendre le tenant opérationnel qu’après validation des connexions et du workflow d’approbation.

### 6.2 Connexion des comptes TikTok

1. L’administrateur client demande une connexion Developer ou Business ;
2. M2L génère un `OAuthState` à usage unique ;
3. l’utilisateur autorise dans TikTok ;
4. NestJS échange le code côté serveur et chiffre le token ;
5. M2L découvre profils ou annonceurs accessibles ;
6. l’utilisateur sélectionne explicitement les cibles ;
7. M2L journalise scopes, compte, utilisateur et date.

### 6.3 Gestion des profils

Un profil TikTok est enregistré uniquement après consentement et association à un client. Les données d’identité sont minimisées. La révocation ou l’expiration d’autorisation rend le profil non opérable et suspend ses jobs.

### 6.4 Gestion des vidéos

Le contenu est chargé dans le stockage objet, contrôlé pour format, taille, droits et statut interne. Il est ensuite soumis à une approbation avant appel TikTok. Le mode de publication est toujours visible : `UPLOAD` ou `DIRECT_POST`.

### 6.5 Publication `video.upload`

1. L’opérateur prépare et soumet le média ;
2. M2L appelle `POST /v2/post/publish/inbox/video/init/` avec `video.upload` ;
3. pour `FILE_UPLOAD`, M2L utilise l’`upload_url` avec les chunks requis ; pour `PULL_FROM_URL`, le domaine/préfixe doit être vérifié ;
4. TikTok notifie l’utilisateur dans sa boîte de réception ;
5. l’utilisateur édite et publie dans TikTok ;
6. M2L suit `publish_id` par status fetch et webhook.

Le flux ne constitue pas une publication publique au moment de l’initiation.

### 6.6 Publication `video.publish`

1. l’application et l’utilisateur disposent du scope `video.publish` ;
2. M2L appelle `POST /v2/post/publish/creator_info/query/` ;
3. l’interface affiche les options retournées par TikTok ;
4. l’utilisateur consent explicitement ;
5. M2L appelle `POST /v2/post/publish/video/init/` ;
6. M2L suit le statut et informe de la modération ;
7. un client non audité reste limité à la visibilité privée selon la documentation.

### 6.7 Workflow TikTok Promote

1. M2L crée une tâche `PromoteManualWorkflow` ;
2. le VA vérifie l’éligibilité affichée dans TikTok et joint une preuve ;
3. l’approbateur financier valide le budget et la méthode ;
4. la liaison Promote/Ads Manager, le paiement et le lancement se font dans TikTok/Ads Manager ;
5. M2L enregistre budget, période, statut, source et justificatif ;
6. les performances sont saisies ou rapprochées, sans prétendre à une API si elle n’est pas testée.

Prérequis d’intégration documentés : solde Promote nul, aucune commande impayée/non terminée, aucun remboursement en cours et compte TikTok lié à TikTok for Business. L’intégration peut exposer budget, période et performance dans l’interface Ads Manager et permettre un pool de fonds partagé, mais cela ne confirme pas une API Promote.

### 6.8 Gestion Ads Manager

1. l’annonceur autorise l’application Business ;
2. M2L associe explicitement l’`advertiser_id` au client ;
3. les ressources et rapports documentés sont synchronisés en lecture ;
4. toute écriture future exige endpoint confirmé, approbation, idempotence et plafond ;
5. une campagne Promote visible dans l’interface n’est pas automatiquement une ressource Marketing API.

### 6.9 Budgets et dépenses

M2L ne saisit ni ne stocke les moyens de paiement. Les budgets internes sont des contrôles de commande, pas une preuve du solde TikTok. Coins, Promote balance et Ads Manager balance sont séparés. Une dépense active au MVP exige approbateur financier et peut être bloquée par le kill switch.

### 6.10 Reporting et statistiques

Les rapports API sont stockés en snapshots avec source, période, fuseau, version et date. Les données Promote manuelles portent `PROMOTE_UI` ou `MANUAL` tant que leur présence dans `/report/integrated/get/` n’est pas démontrée. Toute divergence déclenche une `ReconciliationCase` et non une correction silencieuse.

### 6.11 Gestion des opérateurs

L’administrateur client assigne une tâche à un VA avec client, compte, action, délai et niveau de risque. Le VA exécute et joint une preuve. L’approbateur distinct valide les actions financières ou sensibles. Le système conserve l’auteur, l’approbateur, l’heure et le résultat.

---

## 7. Intégrations TikTok

### 7.1 Content Posting API

| Endpoint | Scope | Fonction | Statut |
|---|---|---|---|
| `POST /v2/post/publish/creator_info/query/` | `video.publish` | options créateur avant Direct Post | **À TESTER** |
| `POST /v2/post/publish/video/init/` | `video.publish` | Direct Post vidéo | **À TESTER** |
| `POST /v2/post/publish/inbox/video/init/` | `video.upload` | upload vers inbox | **À TESTER** |
| `PUT upload_url` | réponse d’init upload | transfert fichier | **À TESTER** |
| `POST /v2/post/publish/status/fetch/` | `video.upload` ou `video.publish` | statut | **CONFIRMÉ PAR DOCUMENTATION** |
| `post.publish.*` webhook | configuration application | événements | **À TESTER** |

Conditions : application enregistrée, produit activé, scope approuvé, autorisation de l’utilisateur, secret côté serveur. `PULL_FROM_URL` exige un domaine/préfixe vérifié. Les quotas documentés sont associés ainsi : `creator_info/query` (`video.publish`) = 20 requêtes/minute par access token ; `video/init` Direct Post (`video.publish`) = 6 requêtes/minute par access token ; `inbox/video/init` Upload (`video.upload`) = 6 requêtes/minute par access token ; `status/fetch` (`video.upload` ou `video.publish`) = 30 requêtes/minute par access token. Le flux Upload est en outre limité à au plus 5 partages en attente sur 24 heures par utilisateur ; les flux de publication sont soumis aux plafonds quotidiens TikTok, dont le plafond de publication et le quota de clients actifs, non chiffrés dans cette spécification. Pour les transferts fichier, l’`upload_url` est valable une heure.

### 7.2 Marketing API — versions et dépréciations

| Capacité | Scope/condition | Statut |
|---|---|---|
| authorization URL annonceur | app Business + consentement annonceur | **À TESTER** |
| `POST /oauth2/access_token/` | `auth_code`, app ID/secret, échange serveur | **À TESTER** |
| découverte des annonceurs | autorisation + `advertiser_id` | **À TESTER** |
| campagnes/ad groups/ads | permission de gestion et endpoints courants | **À TESTER** |
| `GET /report/integrated/get/` — famille actuelle v1.3 | permission reporting, dimensions/métriques compatibles | **À TESTER** |
| `POST /report/task/create/` — famille actuelle v1.3 | rapport asynchrone | **À TESTER** |
| order Promote dédié | aucun endpoint public identifié | **HORS MVP** |

L’annonceur vérifie et autorise l’application. L’`auth_code` est à usage unique et limité dans le temps selon la documentation TikTok. La documentation v1.3 indique `/report/integrated/get/` pour le rapport synchrone et `/report/task/create/` pour le rapport asynchrone. Les anciennes formes `/reports/integrated/get/` et `/reports/task/...` sont historiques ; `/reports/ad/get/`, `/reports/adgroup/get/`, `/reports/advertiser/get/` et `/reports/campaign/get/` sont indiqués comme dépréciés au profit du reporting intégré.

Les endpoints de gestion sont à rechercher dans la famille courante v1.3 : `/campaign/create/`, `/campaign/update/`, `/adgroup/create/`, `/adgroup/update/`, `/ad/create/` et `/ad/update/` sont signalés par la documentation de versioning, mais le scope exact, la disponibilité par compte et le contrat complet restent **À TESTER**. Aucun endpoint Promote n’est inventé.

### 7.3 Promote et Promote ↔ Ads Manager

| Capacité | Statut |
|---|---|
| relier Promote à Ads Manager si TikTok l’affiche | **MANUEL** |
| voir ordre, budget, période et performance dans Ads Manager | **CONFIRMÉ PAR DOCUMENTATION** — interface |
| gérer l’ordre dans l’interface Ads Manager | **CONFIRMÉ PAR DOCUMENTATION** — granularité non définie |
| financer Promote par solde Ads Manager après intégration | **CONFIRMÉ PAR DOCUMENTATION** — interface |
| créer/modifier/pauser via Marketing API | **HORS MVP** |
| retrouver Promote dans `/report/integrated/get/` | **À TESTER** |
| distinguer Promote/classique par champ API | **À TESTER** |
| acheter Coins ou gérer le paiement via M2L | **HORS MVP** |

La disponibilité de l’intégration dépend du marché, du compte, de la plateforme et de l’éligibilité affichée. La documentation consultée ne donne pas une cardinalité garantie pour plusieurs profils Promote vers un ou plusieurs comptes Ads Manager. Cette cardinalité doit être testée.

### 7.4 Références officielles

- [Content Posting API — Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- [Content Posting API — Direct Post vidéo](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post)
- [Content Posting API — Query Creator Info](https://developers.tiktok.com/docs/en/content-posting-api-reference-query-creator-info)
- [Content Posting API — Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video)
- [Content Posting API — Status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status)
- [Scopes TikTok Developer](https://developers.tiktok.com/docs/en/tiktok-api-scopes)
- [Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines)
- [Marketing API — portail](https://ads.tiktok.com/gateway/docs/index)
- [Marketing API — autorisation](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378)
- [API for Business](https://ads.tiktok.com/resources/help/article/marketing-api?lang=en)
- [Reporting et versioning](https://ads.tiktok.com/gateway/docs/index?doc_id=1740579480076290)
- [Promote dans Ads Manager](https://ads.tiktok.com/resources/help/article/about-promote-integration-with-tiktok-ads-manager?lang=en)
- [Intégrer Promote à Ads Manager](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager)
- [Moyens de paiement Promote](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en)

---

## 8. Sécurité, conformité et gestion des risques

### 8.1 Tokens et secrets

Les tokens sont obtenus et utilisés côté serveur, chiffrés au repos, redacted dans les logs et supprimés lors de la révocation. Le `client_secret` ne va jamais dans Next.js, un dépôt, une URL ou une trace. Les OAuth states sont aléatoires, expirables et consommables une fois.

### 8.2 Protection des données clients

Le tenant, client, profil, annonceur et fonds logique sont séparés. Les fichiers sont privés et servis par URL signée. La rétention et la purge des médias, preuves, tokens et snapshots sont configurées par politique validée.

### 8.3 Audit logs

L’audit conserve l’acteur, tenant, client, action, cible, avant/après lorsque pertinent, source, corrélation, heure, résultat et approbateur. Les événements OAuth, connexions, révocations, publications, approbations, synchronisations et actions financières externes doivent être traçables.

### 8.4 Prévention des doubles dépenses

Chaque commande possède une clé d’idempotence et un état transactionnel. Une activation ou modification financière est bloquée sans approbation non expirée. Les retries ne rejouent pas aveuglément une écriture inconnue ; ils passent par réconciliation et intervention humaine si l’état externe est ambigu.

### 8.5 Gestion des erreurs API

- `400` : erreur métier ou paramètre, correction avant retry ;
- `401` : token invalide/expiré, suspension et reconnexion ;
- `403` : scope, politique, quota métier ou interdiction, pas de retry automatique infini ;
- `429` : backoff, limitation par token/compte et alerte ;
- `5xx`/timeout : retry borné, puis dead-letter ;
- webhook dupliqué : déduplication par identifiant/hash.

### 8.6 Risques TikTok et limites d’automatisation

Les risques critiques sont le refus d’audit, la révocation, la suspension de compte, le spam/warm-up artificiel, la mauvaise sélection d’annonceur, la divergence de KPI, l’absence d’API Promote et les changements de quotas ou de version. Aucun contournement, scraping, simulation de navigateur ou automatisation de bannissement ne fait partie du produit.

---

## 9. Tests et critères d’acceptation

### 9.1 Tests fonctionnels obligatoires du MVP

- **A01** : connexion profil, token chiffré, scopes visibles, profil sélectionné ;
- **A02** : `video.upload`, inbox notification et `publish_id`, sans déclarer la vidéo publiée ;
- **A03** : `video.publish`, creator info, consentement et statut ;
- **A04** : status fetch/webhook, doublon idempotent et erreur visible ;
- **A05** : connexion annonceur et association explicite au client ;
- **A06** : rapport Ads Manager rapproché avec période, fuseau et métriques ;
- **A07** : créer une tâche VA Promote, joindre une preuve de vérification, obtenir une approbation financière distincte, exécuter manuellement dans TikTok/Ads Manager, enregistrer le résultat, l’auteur, l’approbateur, la date, la source et le justificatif complet ;
- **A08** : Promote dans rapport API seulement si trouvé et rapproché ;
- **A09** : absence de données bancaires dans M2L.

### 9.2 Tests d’intégration TikTok

Le compte pilote doit tester les deux flux vidéo, les scopes, la vérification de domaine, le webhook, le status fetch, la révocation, les erreurs 401/403/429/5xx, la présence éventuelle de Promote dans `/report/integrated/get/`, les identifiants de provenance et les écarts avec Ads Manager.

Une capture d’écran Ads Manager ne suffit pas à confirmer une API. Une capacité API exige documentation de l’endpoint, scope, requête, réponse JSON, identifiant externe et réconciliation reproductible.

### 9.3 Tests de sécurité

- secrets absents du frontend, HTML, URL, logs et erreurs ;
- replay OAuth refusé ;
- callback ou code expiré refusé ;
- SSRF et URL signée expirée bloquées ;
- webhook invalide/rejoué traité correctement ;
- rotation et purge des tokens ;
- droits VA, approbateur et lecteur vérifiés.

### 9.4 Tests multi-tenant

Deux clients, deux profils, deux annonceurs et deux utilisateurs doivent être créés. Les recherches, exports, médias, jobs, notifications, métriques, audit et rapports ne doivent jamais traverser les tenants. Toute requête sans filtre tenant doit être détectée par revue et test d’intégration.

### 9.5 Validation de capacité progressive (hors condition artificielle du premier pilote)

Les simulations de 10, 50 puis 200 comptes sont réalisées progressivement après le premier pilote fonctionnel ; elles ne constituent pas une condition artificielle de lancement de ce pilote. Elles servent à dimensionner les queues et quotas avant extension. Injecter 401, 403, 429, timeouts, 5xx, panne Redis et webhook dupliqué ; vérifier backoff, dead-letter, absence de doublon, saturation PostgreSQL/Redis, kill switch, restauration et reprise sans double écriture.

### 9.6 Conditions de validation du MVP

Le MVP pilote est accepté si :

1. les tests A01–A07 passent ;
2. la sécurité et l’isolation multi-tenant passent ;
3. les limites TikTok observées sont respectées ;
4. les comptes et scopes réels sont validés ;
5. Promote reste explicitement manuel si son exposition API n’est pas prouvée ;
6. aucun moyen de paiement ni secret interdit n’est stocké ;
7. le kill switch et l’audit fonctionnent ;
8. la documentation du pilote est archivée.

La validation de capacité à 10/50/200 comptes est un jalon séparé avant toute extension commerciale, pas une condition de réussite du premier compte pilote.

---

## 10. Roadmap de développement

### Phase 0 — décisions et accès

Valider marché, comptes pilotes, propriétaires, rôles VA/finance, apps Developer/Business, scopes, domaines vérifiés, politique de confidentialité, comptes de démonstration et budgets plafonds.

**Passage :** accès TikTok et responsables identifiés. Dépendance externe : approbations et audits TikTok.

### Phase 1 — socle sécurisé

Tenant, client, utilisateurs, RBAC, OAuth state, secret manager, audit, migrations PostgreSQL, Docker, CI et observabilité. Aucun appel d’écriture en production.

**Livrables :** schéma initial, contrôles d’accès, secrets, journal et environnements.

### Phase 2 — Content Posting vertical slice

Profils, médias, `video.upload`, `video.publish`, status fetch, webhooks, quotas et UX de consentement.

**Passage :** deux parcours compris, testés, journalisés et conformes ; dépendances : scopes, audit, domaine vérifié et compte pilote.

### Phase 3 — Marketing API en lecture

Autorisation annonceur, découverte `advertiser_id`, campagnes/ad groups/ads, rapports et snapshots, avec rapprochement manuel Ads Manager.

**Passage :** endpoints réels, permissions et métriques confirmés sur le compte pilote.

### Phase 4 — Promote manuel

`PromoteLink`, tâches VA, éligibilité observée, approbation financière, preuves, liaison Ads Manager et suivi manuel.

**Passage :** processus répétable et rentable, sans automatisation non documentée.

### Phase 5 — durcissement production

Sécurité, isolation, charge, reprise, kill switch, alertes, runbooks, rétention, revue juridique, formation et déploiement sur quelques comptes.

**Passage :** critères de validation complets, incidents traités et support opérationnel disponible.

### Phase 6 — décision d’extension

Décider séparément l’extension des profils, l’écriture Marketing API, l’exposition Promote dans les rapports et une éventuelle automatisation d’endpoint Promote officiellement documenté.

Les délais de revue, audit, autorisation et disponibilité régionale TikTok ne sont pas des SLA M2L.

---

## 11. Décisions techniques définitives

### 11.1 Décisions validées

- architecture multi-tenant avec isolation par organisation et client ;
- séparation des adaptateurs Content Posting, Marketing API et Promote manuel ;
- PostgreSQL/Prisma comme source de vérité ;
- BullMQ/Redis pour jobs, retries et réconciliation ;
- tokens chiffrés et aucun paiement stocké ;
- `video.upload` et `video.publish` représentés comme deux parcours distincts ;
- approbation humaine pour toute écriture ou dépense au MVP ;
- provenance et confiance conservées pour chaque donnée ;
- Promote non automatisé sans preuve officielle.

### 11.2 Décisions encore ouvertes

- définition finale du rôle « gestionnaire client » par rapport à administrateur client ;
- marché(s), devise(s), fuseau(x) et plateforme(s) de lancement ;
- seuils de budget et règles de double approbation ;
- politique exacte de conservation des médias et preuves ;
- niveau de reporting requis pour Promote ;
- nombre de comptes pilotes et seuil de charge de première production.

### 11.3 Hypothèses à vérifier

- scopes disponibles et approuvables pour les applications réelles ;
- cardinalité des liaisons Promote ↔ Ads Manager ;
- apparition des campagnes Promote dans `/report/integrated/get/` ;
- présence d’un champ de provenance permettant de distinguer Promote ;
- gestion API réelle des campagnes intégrées ;
- disponibilité régionale et comportement de financement Ads Manager ;
- quotas effectifs Marketing API pour les comptes ciblés.

### 11.4 Points nécessitant des comptes TikTok réels

- OAuth et découverte des profils/annonceurs ;
- `video.upload`, `video.publish`, status et webhooks ;
- publication privée/non auditée et modération ;
- rapport Marketing API rapproché ;
- Promote, liaison Ads Manager, budget, période, statut et performance ;
- Coins versus solde Ads Manager ;
- révocation, suspension, remboursement et limites de compte ;
- isolation de deux clients utilisant des connexions différentes.

---

## 12. Conclusion et recommandations

### 12.1 Faisabilité réelle

Le MVP est techniquement faisable comme plateforme d’orchestration multi-tenant avec publication Content Posting, lecture/reporting Ads Manager et workflow Promote manuel. La faisabilité n’est pas démontrée pour une automatisation complète de Promote, des Coins ou des paiements.

### 12.2 Périmètre commercialisable

M2L peut commercialiser :

- centralisation des comptes autorisés ;
- workflows de publication conformes ;
- synchronisation des données Ads Manager effectivement exposées ;
- tâches VA, approbations, audit et dashboard ;
- rapprochement manuel des opérations Promote.

M2L ne doit pas commercialiser une garantie de création massive de comptes, de warm-up, d’éligibilité Promote, d’achat automatique de Coins ou de pilotage Promote par API sans preuve pilote.

### 12.3 Conditions avant production

1. applications TikTok créées, scopes approuvés et audits satisfaits ;
2. comptes pilotes autorisés par leurs propriétaires ;
3. tests A01–A07, sécurité et isolation réussis ; la charge est validée dans le jalon de capacité progressive ;
4. plafonds et approbateurs nommés ;
5. runbook de révocation, suspension, erreur et réconciliation ;
6. revue légale des contenus, droits, données et paiements ;
7. accord client sur les limites Promote et les étapes humaines ;
8. absence de dépendance à un mécanisme de contournement.

**Recommandation finale : GO SOUS CONDITIONS.** Commencer par le vertical slice Content Posting et la lecture Marketing API, puis valider le workflow Promote manuel sur un compte pilote avant toute généralisation.

---

## Contradictions et informations manquantes résiduelles

1. **Taxonomie des rôles :** les documents sources utilisent « Administrateur client », tandis que la demande consolidée mentionne « Gestionnaire » et « Client ». Aucun arbitrage client n’a été fourni ; le document maître conserve les rôles sources et marque le gestionnaire comme rôle à confirmer.
2. **Statut A07 :** le document de tests indiquait « confirmée par processus », qui ne faisait pas partie des quatre statuts imposés. Il est normalisé ici en **MANUEL**.
3. **Marketing API et Promote :** la documentation confirme la visibilité et la gestion dans l’interface Ads Manager, mais ne confirme pas l’exposition ou la mutation des orders Promote par API. Ce n’est pas résolu théoriquement et reste un test pilote bloquant.
4. **Cardinalité Promote/Ads Manager :** les documents ne donnent pas de règle officielle complète pour plusieurs profils et plusieurs comptes. Elle reste à tester.
5. **Géographie et quotas Marketing API :** les valeurs effectives dépendent des comptes et du portail TikTok ; elles ne peuvent pas être figées dans la spécification sans comptes réels.
6. **Périmètre de reporting Promote :** aucune preuve suffisante ne permet de garantir un champ de provenance ou une ligne dans `/report/integrated/get/`. Le modèle prévoit donc `UNKNOWN` et le rapprochement manuel.
