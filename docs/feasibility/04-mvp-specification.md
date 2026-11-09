# Spécification du MVP de validation

**Objectif :** décider avec des preuves si M2L peut couvrir les opérations autorisées, sans développer la plateforme complète.

## Périmètre

Le MVP cible un seul marché, une organisation, un client, un compte publicitaire de test et deux profils TikTok autorisés. Il ne crée aucun compte TikTok, ne fait aucun warm-up automatique, n’achète aucun Coin et ne saisit aucun moyen de paiement.

## Parcours à tester

### A. Profil et publication

1. Connexion OAuth TikTok Developer avec `user.info.basic` et `video.upload` au minimum.
2. Affichage de l’identité du profil autorisé.
3. Upload d’une vidéo valide avec le flux `video.upload` : initialisation sur `/v2/post/publish/inbox/video/init/`, transfert éventuel vers `upload_url`, puis notification à l’utilisateur pour qu’il édite et publie dans TikTok. Ce flux ne crée pas directement une publication publique.
4. Suivi via `/v2/post/publish/status/fetch/` et webhook `post.publish.*`.
5. Test séparé du flux `video.publish` uniquement si le scope est approuvé : appel de `creator_info/query/`, affichage des options retournées, initialisation Direct Post sur `/v2/post/publish/video/init/`, puis suivi du même statut. Ce flux peut publier directement, mais un client non audité reste limité à la visibilité privée.
6. Vérification de la visibilité réellement obtenue et conservation du `publish_id` ; ne jamais considérer un upload `video.upload` comme une publication terminée.

Les médias doivent être contrôlés avant envoi ; les URLs utilisées avec `PULL_FROM_URL` doivent appartenir à un domaine/préfixe vérifié. Le MVP doit respecter la limite documentée de 6 initialisations par minute par access token pour l’upload vidéo et le plafond de 5 partages en attente sur 24 heures pour un utilisateur. L’`upload_url` retournée pour un upload fichier est valable une heure.

### B. Promote assisté

1. M2L affiche une checklist : compte, âge autorisé, post public, musique, contenu, marché.
2. L’opérateur ouvre Promote dans TikTok.
3. Il renseigne dans M2L : éligible affiché ou non, motif présenté, budget, durée, devise, statut.
4. Le paiement et la validation se déroulent dans TikTok par un opérateur autorisé.
5. M2L collecte le justificatif et distingue les données déclarées des données API.
6. Une tâche de rapprochement est créée pour les résultats à J+1/J+7.

### C. Ads Manager

1. Connexion Marketing API par autorisation annonceur.
2. Lecture de l’annonceur, campagnes, ad groups, ads et rapport minimal.
3. Comparaison avec l’écran Ads Manager.
4. Création d’un objet de test ou brouillon si l’endpoint et le compte le permettent.
5. Aucune activation avec dépense réelle sans double validation.

## Écrans minimum

- Connexions et scopes ;
- profils et comptes annonceurs ;
- calendrier/registre des publications ;
- tâche Promote manuelle ;
- synchronisation Ads Manager ;
- dashboard séparant Promote, Coins et Ads Manager ;
- journal d’audit et incidents.

## Architecture MVP recommandée

Next.js + NestJS + PostgreSQL/Prisma + Redis/BullMQ sont suffisants. L’API TikTok doit être encapsulée derrière deux adaptateurs distincts (`ContentPostingAdapter`, `MarketingApiAdapter`). Promote doit être un module d’orchestration manuelle, pas un faux adaptateur API.

Un stockage objet S3-compatible est nécessaire pour les médias. Les tokens sont chiffrés avec un KMS/secret manager. Les tâches ont une clé d’idempotence et une dead-letter queue. Socket.IO n’est utile que pour la progression ; PostgreSQL reste la source de vérité.

## Critères d’acceptation

- aucun accès inter-client ;
- aucun secret dans navigateur/logs ;
- publication réussie ou erreur TikTok explicite ;
- webhook dupliqué traité une seule fois ;
- éligibilité Promote présentée comme observation, jamais comme décision API ;
- Coins, Promote balance et Ads Manager spend séparés ;
- paiement entièrement humain ;
- rapprochement des KPI contrôlé avec TikTok ;
- arrêt global des tâches et révocation fonctionnels.

## Tests et livrables

Livrer un rapport de test avec requête, scope, compte, date, résultat, capture et lien documentaire. Ajouter tests unitaires, intégration, Playwright, RBAC, rate limit, token révoqué, webhook rejoué et panne Redis.

## Décision après MVP

- **GO** pour contenu + Ads Manager si les deux intégrations passent et que les audits sont obtenus ;
- **GO limité** pour Promote si seul le parcours manuel est disponible ;
- **NO-GO** pour la promesse « création de centaines de comptes et lancement automatique de Promote » sans API/autorisation officielle vérifiée.
