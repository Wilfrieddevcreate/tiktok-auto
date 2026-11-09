# M2L TikTok Ads Operations — étude technique et validation de faisabilité

**Version :** 1.0  
**Date de vérification :** 9 novembre 2026  
**Statut :** étude et proposition — aucun développement applicatif inclus

## 1. Conclusion exécutive

Le projet est **techniquement faisable sous réserve de l’approbation des applications TikTok et de l’accès accordé par chaque annonceur**. Il ne faut toutefois pas le concevoir comme une interface qui remplacerait entièrement TikTok Ads Manager ou l’application TikTok.

La plateforme peut raisonnablement automatiser :

- la connexion OAuth et le rattachement de comptes autorisés ;
- la lecture et la synchronisation des comptes, campagnes, groupes d’annonces, annonces, créations, audiences et rapports exposés par la Marketing API ;
- la préparation, la validation interne et, avec garde-fou humain, la création ou modification de campagnes ;
- la collecte des performances, alertes, journaux et exports ;
- l’envoi de vidéos ou photos vers des profils TikTok autorisés via Content Posting API, selon le mode choisi ;
- les workflows d’approbation, d’attribution aux VA et de traçabilité.

La plateforme ne doit pas promettre, sans confirmation contractuelle et documentaire spécifique :

- la création automatisée de comptes TikTok ou de comptes publicitaires ;
- l’ajout, la modification ou le stockage des moyens de paiement ;
- le contournement d’une suspension, d’une revue de compte ou d’une limitation de publication ;
- la publication publique par une application non auditée ;
- l’accès indifférencié à tous les comptes d’une agence sans autorisation explicite de chaque annonceur.

**Recommandation :** valider d’abord un MVP d’intégration sur un compte publicitaire de test et un profil TikTok de test, avec publication privée ou en mode brouillon/upload si nécessaire. Le lancement production doit être conditionné à la réussite de l’audit TikTok, à la revue sécurité interne et à une procédure humaine de validation des actions sensibles.

## 2. Périmètre réel des APIs

### 2.1 Marketing API — TikTok for Business

La Marketing API est l’interface destinée à piloter des fonctionnalités de TikTok Ads Manager à l’échelle. La documentation officielle décrit notamment la gestion programmatique des campagnes, groupes d’annonces, annonces, créations, audiences, catalogues et rapports. Les endpoints et capacités disponibles dépendent des produits, pays, types de compte, permissions de l’application et évolutions de la plateforme.

Le flux d’autorisation documenté est :

1. créer un compte TikTok for Business et s’enregistrer comme développeur ;
2. créer une application Marketing API ;
3. sélectionner les permissions nécessaires ;
4. générer une URL d’autorisation annonceur ;
5. faire autoriser l’application par l’annonceur ;
6. échanger le code contre un jeton d’accès ;
7. appeler les endpoints avec l’`advertiser_id` autorisé.

L’autorisation est donnée par l’annonceur, et non par une simple connexion locale à M2L. Pour chaque client ou compte publicitaire, M2L doit conserver une relation d’autorisation distincte. Une même autorisation peut permettre l’accès à plusieurs comptes auxquels l’utilisateur TikTok for Business a droit, mais cela doit être découvert et contrôlé explicitement ; il ne faut pas supposer qu’un jeton donne accès à tous les comptes de l’agence.

La documentation de la plateforme mentionne jusqu’à 10 URL de redirection annonceur configurables par application. Ce point doit être pris en compte pour les environnements local, recette et production.

### 2.2 Content Posting API — TikTok for Developers

Cette API concerne le contenu publié sur le profil TikTok d’un utilisateur ayant autorisé l’application. Elle ne remplace pas la Marketing API et ne donne pas, à elle seule, le contrôle d’un compte publicitaire.

Deux modes sont pertinents :

- **Direct Post** : publication directe lorsque l’application est approuvée pour `video.publish` et que l’utilisateur a accordé cette permission ;
- **Upload / Media Upload** : envoi vers TikTok afin que l’utilisateur termine le flux dans TikTok, avec permission `video.upload`.

Pour une vidéo, le flux comprend l’initialisation, le transfert par fichier ou depuis une URL contrôlée, puis le suivi du statut. Pour une photo, l’endpoint de contenu est différent et les paramètres de mode et de type de média sont obligatoires. La fonctionnalité exige une UX conforme : l’utilisateur doit comprendre ce qui est envoyé, pouvoir relire/éditer le contenu lorsque le flux le prévoit, et être informé de l’état de publication.

Les clients non audités sont limités au mode de visibilité privée pour le Direct Post. L’application doit donc être auditée avant de promettre une publication publique. TikTok peut aussi refuser une publication pour un format invalide, un risque de spam, une interdiction de publier, une modération ou un retrait d’autorisation.

## 3. Autorisations, audits et validations

### 3.1 Marketing API

À préparer :

- identité juridique et compte TikTok for Business de l’agence ;
- application développeur et description précise du cas d’usage ;
- permissions strictement minimales pour le MVP ;
- URLs de redirection HTTPS en production ;
- politique de confidentialité, conditions d’utilisation et contacts de support ;
- compte(s) de démonstration et parcours fonctionnel disponible pour une revue ;
- procédure de révocation et de suppression des données ;
- respect des limites de débit, des politiques publicitaires et des conditions TikTok.

La mise en production dépend de l’état Live et des approbations obtenues. TikTok n’annonce pas de délai garanti de revue et peut demander des modifications ou réexaminer les changements importants.

### 3.2 Content Posting API

À prévoir :

- ajout du produit Content Posting API à l’application ;
- demande et approbation de `video.publish` ou `video.upload` ;
- autorisation individuelle de chaque utilisateur TikTok ;
- domaine ou préfixe d’URL vérifié si les médias sont récupérés par URL ;
- écran d’export conforme aux UX guidelines ;
- webhook HTTPS et mécanisme de polling de secours ;
- audit nécessaire pour lever la restriction de visibilité privée du client non audité.

La publication ne doit être déclenchée qu’après consentement explicite de l’utilisateur. Les secrets clients ne doivent jamais être exposés au navigateur, au dépôt Git ou à un prestataire non autorisé.

## 4. Matrice de faisabilité fonctionnelle

| Fonction | Faisabilité | Conditions et décision MVP |
|---|---|---|
| Connecter un compte Business | Oui | OAuth/autorisation annonceur, permissions approuvées |
| Gérer plusieurs annonceurs | Oui, sous contrôle | Une relation d’autorisation par périmètre ; isolation stricte des tenants |
| Lire campagnes et performances | Oui, selon endpoints approuvés | Synchronisation paginée, idempotente, respect des limites |
| Créer/modifier campagnes | Probablement oui via Marketing API | Vérifier précisément objectifs, placements, formats et statuts exposés pour le marché cible ; approbation humaine obligatoire au MVP |
| Gérer créations et médias publicitaires | Oui pour les capacités exposées | Valider formats, droits et statut de modération |
| Audiences, pixels, événements, catalogues | Partiel à oui | Modules optionnels ; permissions et produits activés à confirmer dans le portail |
| Rapports personnalisés | Oui pour les rapports documentés | Stockage des snapshots, fuseaux horaires et métriques versionnées |
| Publier vidéo/photo sur profil TikTok | Oui | `video.publish` ou `video.upload`, consentement utilisateur, restrictions de format et audit |
| Programmer une publication | À implémenter dans M2L | Le scheduler déclenche l’API ; TikTok ne doit pas être présenté comme garantissant une planification native universelle |
| Créer un compte TikTok | Non retenu | Onboarding manuel TikTok |
| Créer un compte publicitaire | Non garanti / hors MVP | Création et revue via TikTok Ads Manager ou Business Center |
| Ajouter une carte ou payer | Hors périmètre API confirmé | Gestion manuelle dans TikTok ; M2L ne stocke aucun moyen de paiement |
| Contourner bannissement/restriction | Interdit | Escalade humaine et support TikTok uniquement |

## 5. Architecture cible proposée

### 5.1 Principes

Architecture modulaire, multi-tenant, orientée événements et « API adapter ». Le domaine M2L ne doit pas dépendre directement des modèles TikTok : les réponses externes sont normalisées et conservent leur identifiant/source/version.

### 5.2 Composants

- **Next.js / TypeScript / Tailwind** : interface opérateur, dashboard, workflow VA, écran de connexion, approbation et audit log. Aucun secret TikTok côté client.
- **NestJS** : API métier, RBAC, validation des commandes, adaptateurs TikTok, webhooks, règles d’approbation.
- **PostgreSQL / Prisma** : état métier, relations multi-tenant, snapshots de synchronisation, audit et idempotence.
- **Redis / BullMQ** : synchronisations, rapports, uploads, publications planifiées, retries avec backoff et tâches de réconciliation.
- **Socket.IO** : progression d’upload, statut de job, alertes et changement de statut ; la source de vérité reste PostgreSQL.
- **Stockage objet S3-compatible** : vidéos, photos et exports avec URL signées, antivirus, durée de rétention et chiffrement. TikTok doit récupérer les médias via une URL vérifiée si le mode URL est utilisé.
- **Secrets manager/KMS** : chiffrement des tokens d’accès au repos, rotation des clés, séparation des secrets par environnement.
- **Observabilité** : logs structurés sans tokens, métriques par tenant/endpoint, traces corrélées par `request_id`/`log_id`, alertes de quotas et erreurs 401/403/429.

Flux recommandé :

`Utilisateur → Next.js → NestJS → commande approuvée → BullMQ → adaptateur TikTok → webhook/polling → PostgreSQL → Socket.IO/dashboard`

Toute opération d’écriture sensible doit être un « command » avec idempotency key, auteur, justification, état `PENDING_APPROVAL | APPROVED | EXECUTING | SUCCEEDED | FAILED`, et possibilité d’annulation avant exécution si TikTok le permet.

### 5.3 Sécurité et gouvernance

- RBAC : Owner, Admin, Media Buyer, VA, Analyst, Auditor, avec permissions par organisation, client et compte publicitaire.
- 2FA et SSO à envisager pour les rôles privilégiés.
- Cloisonnement tenant au niveau service et requêtes ; tests systématiques de non-fuite inter-client.
- Chiffrement TLS en transit et chiffrement applicatif des tokens au repos.
- Jamais de numéro de carte, CVV, coordonnées bancaires ou mot de passe TikTok dans M2L.
- Journal immuable des connexions, approbations, modifications, publications et synchronisations.
- Redaction des secrets dans logs, traces, exceptions et tickets.
- Suppression/révocation : déconnexion locale, révocation auprès de TikTok si disponible, purge des tokens et médias selon la politique de conservation.

## 6. Schéma de données prévisionnel

Les tables suivantes sont proposées ; les noms d’objets TikTok sont conservés dans des champs d’identifiants externes, jamais comme clé métier unique isolée.

### Organisation et accès

- `Organization(id, name, status, created_at)`
- `User(id, email, name, status, mfa_enabled)`
- `Membership(user_id, organization_id, role)`
- `Client(id, organization_id, legal_name, timezone, status)`
- `RolePermission(role, permission)`

### Connexions TikTok

- `TikTokApp(id, product, client_key_ref, environment, review_status)`
- `TikTokConnection(id, organization_id, client_id, product, external_user_id, encrypted_access_token, expires_at, scopes, status, last_validated_at)`
- `AdvertiserAccount(id, client_id, connection_id, advertiser_id, name, currency, timezone, status, last_synced_at)`
- `AccountMembership(id, user_id, advertiser_account_id, role)`
- `OAuthState(id, provider, state_hash, redirect_uri, expires_at, consumed_at)`

### Publicités et performances

- `Campaign(id, advertiser_account_id, external_id, name, objective, status, raw_version, synced_at)`
- `AdGroup(id, campaign_id, external_id, name, targeting_json, budget, schedule_json, status)`
- `Ad(id, ad_group_id, external_id, creative_id, identity_type, status)`
- `Creative(id, advertiser_account_id, external_id, media_asset_id, spark_identity_ref, review_status)`
- `Audience(id, advertiser_account_id, external_id, type, status)`
- `ReportSnapshot(id, advertiser_account_id, level, dimensions_json, metrics_json, period_start, period_end, fetched_at, api_version)`
- `SyncCursor(id, resource_type, advertiser_account_id, cursor, last_success_at)`

### Publications organiques

- `TikTokProfile(id, client_id, connection_id, open_id, display_name, status)`
- `MediaAsset(id, client_id, object_key, media_type, checksum, size_bytes, verified_url, rights_status, retention_until)`
- `ContentItem(id, client_id, media_asset_id, caption, planned_at, approval_status, human_approved_by)`
- `PublishAttempt(id, content_item_id, profile_id, mode, publish_id, status, fail_reason, requested_at, completed_at)`
- `WebhookEvent(id, product, event_type, external_event_id, payload_hash, received_at, processed_at)`

### Opérations et conformité

- `ApprovalRequest(id, organization_id, action_type, target_type, target_id, requested_by, approved_by, expires_at, status)`
- `Job(id, queue, idempotency_key, payload_ref, attempts, status, started_at, finished_at)`
- `AuditLog(id, organization_id, actor_id, action, target, before_json, after_json, correlation_id, created_at)`
- `Incident(id, organization_id, severity, category, status, owner_id, resolution)`

Les payloads bruts doivent être minimisés, chiffrés ou expurgés lorsque nécessaire. Les métriques doivent porter leur version d’API et leur fuseau afin d’éviter les écarts de reporting.

## 7. Découpage des modules

1. **Identity & Tenant** : organisations, utilisateurs, RBAC, MFA.
2. **TikTok Business Connection** : OAuth, autorisations, comptes annonceurs, révocation.
3. **Marketing Adapter** : clients HTTP, pagination, rate limit, retries, normalisation.
4. **Campaign Operations** : campagnes, groupes, annonces, validations et commandes.
5. **Creative & Media** : métadonnées, stockage objet, contrôles de format et droits.
6. **Reporting & Dashboard** : jobs de collecte, snapshots, métriques, exports.
7. **Content Publishing** : profils, direct post/upload, statut, webhooks, calendrier.
8. **VA Workflow** : tâches, SLA, assignation, commentaires, approbations.
9. **Notifications & Realtime** : email, alertes, Socket.IO.
10. **Audit & Compliance** : journal, rétention, incidents, accès aux données.
11. **Platform** : configuration, secrets, queues, observabilité, migrations et sauvegardes.

## 8. Dépendances et contrats à valider

### Dépendances applicatives

- Node.js LTS, TypeScript, Next.js, NestJS, Prisma et PostgreSQL ;
- Redis et BullMQ ;
- Socket.IO ;
- Jest, Testing Library et Playwright ;
- client HTTP avec timeout, retry contrôlé et circuit breaker ;
- stockage objet compatible S3 ;
- fournisseur email/notification ;
- secret manager/KMS et outil d’observabilité.

### Dépendances externes

- application TikTok for Business approuvée et permissions Marketing API ;
- application TikTok for Developers approuvée pour Content Posting API ;
- comptes annonceurs autorisant explicitement l’agence ;
- profils TikTok de test autorisant l’application ;
- domaines HTTPS vérifiés pour les médias tirés par URL ;
- comptes de test, moyens de paiement et revues de compte gérés hors M2L ;
- clarification contractuelle des droits sur les médias, Spark Ads, contenus de clients et données de reporting.

Les scopes et endpoints doivent être gérés dans une matrice de compatibilité versionnée. L’application doit détecter une permission manquante et produire une action de remédiation ; elle ne doit pas réessayer indéfiniment une erreur 403.

## 9. Risques et limitations

### Risques TikTok

- approbation, audit ou passage Live refusé ou retardé ;
- changements de version, dépréciations et différences de disponibilité selon région/compte ;
- quotas, erreurs 429 et fenêtres de maintenance ;
- autorisation révoquée, token expiré ou permissions réduites ;
- modération publicitaire ou organique indépendante de M2L ;
- publication privée pour client non audité ;
- comptes publicitaires suspendus, en revue ou sans moyen de paiement valide.

### Risques produit et opérationnels

- mauvaise sélection d’un compte ou d’un tenant ;
- double dépense causée par retry non idempotent ;
- divergence entre état local et Ads Manager ;
- métriques différentes selon fuseau, attribution ou fenêtre de reporting ;
- VA qui approuve une action hors de son périmètre ;
- perte ou exposition de médias sous droits ;
- dépendance excessive à des endpoints non documentés ou à du scraping, qui est exclu du projet.

### Mesures de réduction

- dry-run, prévisualisation et double approbation pour publication, budget et statut actif ;
- budgets plafond par compte et kill switch global par organisation ;
- idempotency keys, reconciliation jobs et journal d’audit ;
- backoff exponentiel borné, dead-letter queues et replay manuel ;
- séparation des environnements et comptes de test ;
- contrats d’API et tests de non-régression planifiés à chaque bulletin TikTok ;
- alertes sur dépenses, tokens, erreurs, permissions et dérive de données.

## 10. MVP de validation d’intégration

Le MVP doit être volontairement étroit :

1. une organisation, un client et un compte annonceur de test ;
2. connexion Marketing API et affichage de l’identifiant/état du compte ;
3. synchronisation en lecture seule des campagnes, groupes, annonces et d’un rapport minimal ;
4. connexion d’un profil TikTok de test via Content Posting API ;
5. upload d’une vidéo en mode `MEDIA_UPLOAD` et suivi par webhook/polling ;
6. si approuvé, un Direct Post de test avec visibilité conforme au statut d’audit ;
7. workflow de demande, approbation humaine et journal d’audit ;
8. dashboard simple montrant synchronisation, erreurs et statut de publication ;
9. observabilité, révocation de connexion, purge de token et test de restauration.

Le MVP ne doit pas inclure la gestion des paiements, la création d’adcomptes, l’activation automatique de campagnes, l’optimisation budgétaire autonome, le scraping, le contournement de restrictions ni une gestion multi-région complexe.

### Critères de sortie du MVP

- une autorisation distincte ne permet pas de lire un autre client ;
- un token n’apparaît jamais dans le navigateur, les logs ou les erreurs ;
- une perte d’autorisation est détectée et signalée ;
- un retry ne crée pas de doublon connu ;
- une publication affiche un état final fiable ou une action humaine explicite ;
- les erreurs 400/401/403/429/5xx sont classées et testées ;
- les campagnes et rapports se réconcilient avec les valeurs visibles dans Ads Manager sur un jeu de contrôle ;
- le kill switch bloque effectivement les commandes d’écriture ;
- les preuves nécessaires à la revue TikTok sont disponibles : UX, démo, politique de confidentialité et compte de test.

## 11. Plan de développement par phases

### Phase 0 — qualification (1 à 2 semaines)

Obtenir les comptes, applications, scopes, marchés cibles et comptes de test. Vérifier dans les portails les endpoints réellement activables. Documenter les décisions non garanties par la documentation publique.

### Phase 1 — vertical slice d’intégration (3 à 5 semaines)

Tenant minimal, OAuth, secrets, connexion d’un annonceur, lecture seule, synchronisation BullMQ, audit et dashboard technique.

### Phase 2 — Content Posting contrôlé (2 à 4 semaines)

Profil TikTok, stockage média, upload, statut, webhook, UX de consentement et publication de test.

### Phase 3 — opérations publicitaires assistées (4 à 7 semaines)

Modèles campagne/groupe/annonce, validation, prévisualisation, commandes avec approbation et réconciliation. Les écritures restent limitées à des comptes de test jusqu’à validation.

### Phase 4 — reporting et VA (3 à 5 semaines)

Dashboard métier, rapports historiques, tâches VA, commentaires, notifications, exports et SLA.

### Phase 5 — durcissement production (3 à 6 semaines)

Audit TikTok, sécurité, tests de charge, reprise après incident, sauvegardes, runbooks, monitoring, revue juridique et déploiement progressif.

Ces durées sont des ordres de grandeur hors délais d’approbation TikTok, qui sont externes et non garantis.

## 12. Estimation de complexité

- **Connexion et lecture Marketing API :** moyenne à élevée ; principal risque = scopes, modèles et réconciliation.
- **Content Posting :** moyenne ; la complexité est surtout dans l’UX obligatoire, les médias, webhooks et états intermédiaires.
- **Écritures de campagnes :** élevée ; nombreux paramètres, validation TikTok, idempotence, effets financiers et variations par marché.
- **Multi-tenant et RBAC :** élevée ; une erreur d’isolation est critique.
- **Reporting :** moyenne à élevée ; pagination, fuseaux, attribution, snapshots et évolution des métriques.
- **Workflow VA/audit :** moyenne ; forte exigence de traçabilité.
- **Paiements/comptes :** hors périmètre recommandé ; à traiter manuellement dans les interfaces TikTok.

Pour une première équipe de 2 à 3 développeurs TypeScript avec DevOps partagé, le MVP d’intégration représente environ **8 à 12 semaines de travail calendrier**, hors délais de revue TikTok. La plateforme complète, avec écriture de campagnes, reporting robuste, VA, sécurité et exploitation, est plutôt un programme de **4 à 7 mois** avant généralisation progressive.

## 13. Stratégie de tests

### Tests automatisés

- unitaires : normalisation, permissions, budgets, transitions d’état, retries ;
- contract tests : réponses figées des adaptateurs TikTok, pagination, champs absents et erreurs ;
- intégration : PostgreSQL, Prisma, Redis, BullMQ, chiffrement et webhooks idempotents ;
- sécurité : RBAC, isolation tenant, redaction de secrets, SSRF sur URLs média, replay de webhook, rate limiting ;
- Playwright : OAuth simulé, approbation, upload, statut, erreur et révocation ;
- charge : synchronisations parallèles, rapports, Socket.IO et queues ;
- résilience : 401/403/429/5xx, timeout, token révoqué, webhook dupliqué, panne Redis ;
- migrations et restauration : sauvegarde PostgreSQL, purge, rétention et reprise.

### Tests manuels sur sandbox/comptes de test

- autoriser un annonceur puis vérifier uniquement les comptes attendus ;
- synchroniser un jeu de campagnes et comparer les métriques à Ads Manager ;
- modifier un contenu et confirmer le passage par approbation ;
- publier une vidéo valide, une vidéo invalide et une URL non vérifiée ;
- tester une révocation depuis TikTok ;
- vérifier visibilité privée/non auditée et comportement après audit ;
- tester permissions VA, Admin, Analyst et Auditor ;
- confirmer que le paiement et les données bancaires ne sont jamais demandés ni persistés par M2L.

## 14. Sources officielles à surveiller

- [TikTok API for Business — Marketing API](https://ads.tiktok.com/gateway/docs/index)
- [Autorisation Marketing API](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378)
- [TikTok Developers — Content Posting API Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- [TikTok Developers — Upload Content](https://developers.tiktok.com/docs/en/content-posting-api-get-started-upload-content)
- [TikTok Developers — statut et webhooks de publication](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status)
- [TikTok Developers — Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines)
- [TikTok Developers — App Review FAQ](https://developers.tiktok.com/docs/en/getting-started-faq)
- [TikTok Developers — Developer Guidelines](https://developers.tiktok.com/docs/en/our-guidelines-developer-guidelines)
- [TikTok Ads — configuration d’un compte publicitaire](https://ads.tiktok.com/resources/help/article/account-setup-faq)
- [TikTok Ads — moyens de paiement](https://ads.tiktok.com/resources/help/article/add-a-payment-method-for-automatic-payment-in-tiktok-ads-manager)

Les capacités TikTok évoluent. Avant chaque implémentation, il faut vérifier la documentation de l’endpoint, les scopes disponibles dans l’application, le marché concerné, les limites de débit et les conditions d’audit. Toute capacité non vérifiable dans une source officielle ou dans un compte de test autorisé doit rester hors périmètre.
