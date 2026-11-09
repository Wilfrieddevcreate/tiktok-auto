# Checklist de validation du pilote technique M2L

**Date de préparation :** 9 novembre 2026  
**Règle :** aucun test n’est pré-coché comme réussi. Le champ Résultat observé est complété uniquement après exécution réelle.

## Statuts de test

`À TESTER` · `VALIDÉ` · `ÉCHEC` · `NON DISPONIBLE`.

## Préparation commune

- [ ] compte pilote et propriétaire identifiés ;
- [ ] organisation/client M2L créés ;
- [ ] marché, devise, fuseau et plateforme documentés ;
- [ ] comptes de test autorisés sans donnée de paiement stockée dans M2L ;
- [ ] URLs de redirection HTTPS configurées ;
- [ ] domaine/préfixe média vérifié si `PULL_FROM_URL` est utilisé ;
- [ ] applications Developer et Business distinctes ;
- [ ] secrets placés dans le secret manager ;
- [ ] budget de test et approbateur nommés ;
- [ ] procédure de révocation et incident disponible.

## Tests du pilote

### P01 — Connexion profil TikTok Developer

- **Prérequis :** app Developer, Login Kit, redirect URI, profil test.
- **Procédure :** lancer OAuth avec `state`, demander `user.info.basic` et le scope de publication requis, recevoir le callback, échanger côté serveur.
- **Résultat attendu :** `TikTokConnection(product=DEVELOPER)` créée avec token chiffré, `open_id`, scopes et expirations ; aucune donnée sensible au frontend.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Preuve :** [Login Kit OAuth](https://developers.tiktok.com/docs/en/login-kit-overview), logs redacted, `OAuthState`.

### P02 — Autorisation des scopes Developer

- **Prérequis :** P01.
- **Procédure :** confirmer les scopes effectivement accordés dans la réponse et dans le portail.
- **Résultat attendu :** `video.upload` et/ou `video.publish` sont présents uniquement si approuvés et consentis.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Preuve :** [Scopes](https://developers.tiktok.com/docs/en/scopes-overview).

### P03 — Upload `video.upload`

- **Prérequis :** P01/P02, vidéo conforme, scope `video.upload`.
- **Procédure :** appeler `POST /v2/post/publish/inbox/video/init/`, transférer via `upload_url` ou URL vérifiée, conserver `publish_id`, attendre la notification inbox.
- **Résultat attendu :** upload accepté ou erreur TikTok explicite ; l’état n’est pas marqué publié avant action de l’utilisateur dans TikTok.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Limites :** 6 requêtes/min/access token pour l’init, maximum 5 partages en attente/24 h par utilisateur, URL fichier valable 1 h.
- **Preuve :** [Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video).

### P04 — Direct Post `video.publish`

- **Prérequis :** scope `video.publish`, app autorisée, profil test.
- **Procédure :** appeler `creator_info/query`, afficher les options retournées, recueillir le consentement, appeler `video/init` et transférer le média.
- **Résultat attendu :** requêtes conformes aux options TikTok ; statut suivi ; visibilité conforme au statut d’audit.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Limites :** `creator_info/query` 20 requêtes/min/access token ; `video/init` 6 requêtes/min/access token ; plafonds quotidiens TikTok non chiffrés ici.
- **Preuve :** [Query Creator Info](https://developers.tiktok.com/docs/en/content-posting-api-reference-query-creator-info), [Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post).

### P05 — Statut publication

- **Prérequis :** `publish_id` issu de P03 ou P04.
- **Procédure :** appeler `POST /v2/post/publish/status/fetch/` et configurer le webhook officiel Content Posting si disponible.
- **Résultat attendu :** transitions et erreurs persistées ; doublons dédupliqués ; aucun événement hors tenant.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Limite :** 30 requêtes/min/access token pour status fetch.
- **Preuve :** [Status/Webhooks](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status).

### P06 — Connexion TikTok for Business

- **Prérequis :** app Business, Advertiser Authorization URL, annonceur propriétaire.
- **Procédure :** autoriser l’app, vérifier l’identité, recevoir l’`auth_code`, échanger côté serveur avec `/oauth2/access_token/`.
- **Résultat attendu :** `TikTokConnection(product=BUSINESS)` indépendante de Developer, permissions et statut enregistrés.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Preuve :** [Business authorization](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378).

### P07 — Accès à l’annonceur test

- **Prérequis :** P06.
- **Procédure :** découvrir les comptes autorisés, sélectionner un `advertiser_id`, rattacher au bon client.
- **Résultat attendu :** compte visible dans le bon tenant seulement ; aucune connexion Developer ne donne cet accès.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.

### P08 — Reporting Ads Manager

- **Prérequis :** P07 et permission reporting.
- **Procédure :** vérifier dans le portail la version et appeler `/report/integrated/get/`; tester `/report/task/create/` si le rapport asynchrone est exposé ; comparer à Ads Manager.
- **Résultat attendu :** dimensions/métriques compatibles, période/fuseau/source enregistrés, écarts réconciliés.
- **Résultat observé :** _à compléter_.
- **Statut :** À TESTER.
- **Preuve :** [Marketing API versioning/reporting](https://ads.tiktok.com/gateway/docs/index?doc_id=1740579480076290).

### P09 — Promote manuel

- **Prérequis :** profil éligible affiché, tâche VA, approbateur financier, budget plafond.
- **Procédure :** vérifier l’éligibilité dans TikTok, joindre une preuve, obtenir une approbation distincte, exécuter dans TikTok/Ads Manager, enregistrer résultat, ordre, budget, période, source et preuve.
- **Résultat attendu :** traçabilité complète ; aucun paiement saisi ou stocké par M2L ; Promote reste manuel.
- **Résultat observé :** _à compléter_.
- **Statut de la capacité :** MANUEL.
- **Statut d’exécution du test :** À TESTER.
- **Preuve :** [Promote integration](https://ads.tiktok.com/resources/help/article/about-promote-integration-with-tiktok-ads-manager?lang=en).

### P10 — Données Promote exposées par API

- **Prérequis :** P09 et order Promote connu.
- **Procédure :** rechercher l’ordre dans les endpoints Marketing API autorisés et `/report/integrated/get/`; comparer identifiants, budget, période, statut et performances.
- **Résultat attendu :** classer chaque donnée `VALIDÉ` uniquement avec réponse API reproductible ; sinon `NON DISPONIBLE` avec preuve de recherche et explication, ou `À TESTER` si la vérification est incomplète. L’absence d’exposition API ne bloque pas le MVP si P09 est validé et si le reporting alternatif porte `source=PROMOTE_UI` ou `source=MANUAL`.
- **Résultat observé :** _à compléter_.
- **Statut de la capacité :** À TESTER.
- **Statut d’exécution du test :** À TESTER.
- **Règle :** la présence dans Ads Manager n’est pas une preuve d’exposition API.

## Tests de sécurité et fiabilité

### P11 — Callback OAuth rejoué, expiré ou mauvais client

Résultat attendu : callback refusé, `OAuthState` non réutilisable, aucun token émis et événement d’audit ; statut : À TESTER.

### P12 — Révocation pendant job

Résultat attendu : job suspendu après 401/permission perdue, aucune nouvelle mutation, token purgé ou marqué réautorisation requise ; statut : À TESTER.

### P13 — Upload interrompu/URL expirée

Résultat attendu : timeout ou URL expirée produit un échec explicite ou une reprise contrôlée ; aucune double publication ; statut : À TESTER.

### P14 — Approbation expirée/paramètre modifié

Résultat attendu : commande refusée, snapshot inchangé, nouvelle approbation exigée ; statut : À TESTER.

### P15 — Panne Redis après PostgreSQL

Résultat attendu : outbox non publiée reste disponible, republication idempotente, aucune perte ni double exécution ; statut : À TESTER.

### P16 — Webhook dupliqué, invalide ou désordonné

Résultat attendu : invalide rejeté, doublon ignoré, ordre non séquentiel réconcilié, événement inconnu conservé `UNSUPPORTED`/`IGNORED` ; statut : À TESTER.

### P17 — Accès cross-tenant média/rapport

Résultat attendu : API, SQL/RLS, job, export et URL objet refusent l’accès ; audit créé ; statut : À TESTER.

## Critères de sortie

Le pilote est validé si P01–P09, P11–P17 et les tests fonctionnels obligatoires correspondants sont exécutés avec preuves, en particulier P09/A07. P10 peut rester `NON DISPONIBLE` sans bloquer le MVP si la recherche est documentée, si le reporting Promote manuel est défini avec sa provenance et si le client l’accepte. Les simulations 10/50/200 comptes sont une phase de capacité progressive ultérieure.
