# Spécification des intégrations TikTok

**Date de vérification : 9 novembre 2026**

## A. Content Posting API

| Endpoint | Scope | Usage | Statut | Limites/conditions |
|---|---|---|---|---|
| `POST /v2/post/publish/creator_info/query/` | `video.publish` | options du créateur avant Direct Post | À TESTER | requis avant Direct Post ; options retournées par TikTok |
| `POST /v2/post/publish/video/init/` | `video.publish` | Direct Post vidéo | À TESTER | consentement, app approuvée, audit pour public |
| `POST /v2/post/publish/inbox/video/init/` | `video.upload` | upload vers inbox/draft | À TESTER | l’utilisateur doit terminer dans TikTok |
| `PUT upload_url` | issu de l’init upload | transfert fichier | À TESTER | URL valable 1 h ; chunks/headers requis |
| `POST /v2/post/publish/status/fetch/` | `video.upload` ou `video.publish` | état publication | CONFIRMÉE PAR DOCUMENTATION | 30 requêtes/min par access token documentées |
| webhook `post.publish.*` | configuration app | événements finaux | À TESTER | endpoint HTTPS et traitement idempotent |

Conditions communes : application enregistrée, produit Content Posting activé, scope approuvé, autorisation utilisateur et secrets côté serveur. Pour `PULL_FROM_URL`, domaine/préfixe vérifié. Pour `video.upload`, TikTok documente au plus 5 partages en attente sur 24 h par utilisateur et 6 initialisations/minute par access token. Pour `video.publish`, les options et la durée maximale doivent provenir de `creator_info/query`.

Le statut `PUBLISH_COMPLETE` de `video.upload` signifie que l’utilisateur a finalisé le post après l’inbox flow ; l’initialisation seule ne publie pas.

Sources : [Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-get-started), [Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video), [Status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status), [Scopes](https://developers.tiktok.com/docs/en/tiktok-api-scopes).

## B. Marketing API

| Domaine | Endpoint/capacité à tester | Autorisation | Statut |
|---|---|---|---|
| OAuth Business | `/oauth2/access_token/` après authorization URL | app Business + autorisation annonceur | À TESTER |
| Compte | advertiser/account endpoints du portail courant | scope app + `advertiser_id` | À TESTER |
| Campagnes/ad groups/ads | endpoints v1.3 documentés | permission de gestion | À TESTER |
| Reporting | `/report/integrated/get/` ; `/report/task/create/` | permission reporting | À TESTER |
| Promote order | endpoint dédié non identifié | aucune preuve publique | HORS MVP |

L’annonceur doit autoriser l’application via l’URL Business ; l’`auth_code` est à usage unique et limité dans le temps selon la documentation d’autorisation. Les rapports sont soumis aux dimensions/métriques compatibles, pagination, throttling et évolutions d’API. Les anciens endpoints de rapports peuvent être dépréciés ; l’adaptateur doit utiliser le portail courant.

La Marketing API ne doit être déclarée compatible avec Promote que si un test pilote retrouve une campagne Promote connue dans une réponse API et permet une réconciliation fiable. La présence dans Ads Manager est une capacité d’interface, pas une preuve API.

Sources : [Authorization](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378), [API for Business](https://ads.tiktok.com/resources/help/article/marketing-api?lang=en), [Reporting/versioning](https://ads.tiktok.com/gateway/docs/index?doc_id=1740579480076290).

## C. Promote manuel / intégration Ads Manager

| Capacité | Statut |
|---|---|
| relier un compte Promote à Ads Manager si TikTok le propose | MANUELLE |
| prérequis : solde Promote nul, pas d’impayé/ordre en cours/remboursement, lien TT4B | CONFIRMÉE PAR DOCUMENTATION |
| voir budget, période, performance dans Ads Manager | CONFIRMÉE PAR DOCUMENTATION — interface |
| gérer l’ordre dans Ads Manager | CONFIRMÉE PAR DOCUMENTATION — granularité API non prouvée |
| utiliser le solde Ads Manager pour Promote après intégration | CONFIRMÉE PAR DOCUMENTATION — interface |
| créer/modifier/pauser via Marketing API | HORS MVP / non documenté |
| retrouver dans `/report/integrated/get/` | À TESTER |
| acheter Coins ou gérer paiements dans M2L | HORS MVP / MANUELLE |

Sources : [integration](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager), [benefits](https://ads.tiktok.com/resources/help/article/about-promote-integration-with-tiktok-ads-manager?lang=en), [payment methods](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en).
