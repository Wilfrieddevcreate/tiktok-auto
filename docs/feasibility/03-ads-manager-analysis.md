    # Analyse — TikTok Ads Manager et Marketing API

    **Date de vérification : 9 novembre 2026**

    ## Périmètre confirmé

    TikTok for Business documente une Marketing API destinée à interagir avec Ads Manager à l’échelle : campagnes, groupes d’annonces, publicités, créations, audiences, catalogues et rapports selon les produits et permissions disponibles.

    Le modèle Ads Manager est indépendant de Promote :

    | Élément | Ads Manager | Promote |
    |---|---|---|
    | Objet principal | Compte annonceur et campagnes | Promotion rapide d’un post/LIVE |
    | Solde | Solde/billing Ads Manager ou Business Center | Coins, Promote balance ou Ads Manager après intégration |
    | API | Marketing API documentée | Aucune API Promote/Coins publique dédiée identifiée |
    | Autorisation | Annonceur TikTok for Business | Utilisateur/compte TikTok et conditions Promote |
    | Reporting | Rapports Marketing API | Dashboard Promote et éventuelle intégration Ads Manager |

    ## Connexion multi-comptes

    Le développeur crée une application, sélectionne ses permissions et envoie une URL d’autorisation à chaque annonceur. L’annonceur approuve et vérifie son identité ; le code est ensuite échangé côté serveur contre un jeton d’accès de longue durée. Une application peut gérer plusieurs relations, mais M2L doit conserver l’association exacte `organisation → client → connection → advertiser_id`.

    Le jeton ne doit jamais être choisi uniquement à partir d’un nom affiché. Chaque appel doit vérifier l’organisation, le compte cible, le scope et le rôle de l’utilisateur M2L.

    ## Gestion publicitaire

    La documentation API décrit la hiérarchie campagne, ad group et ad. Les objectifs, placements, audiences, budgets, planification, optimisation et enchères peuvent dépendre du marché et du type de compte. La création doit être traitée comme une commande financière : prévisualisation, validation, plafond, double contrôle optionnel, clé d’idempotence, journal et possibilité d’arrêt.

    La création de comptes publicitaires, leur revue business, leur fuseau, devise, région et configuration de paiement restent des étapes de portail/Business Center à confirmer manuellement. Une modification de devise, fuseau, région ou identité peut être impossible ou déclencher une nouvelle revue.

    ## Reporting

    La documentation récente indique l’utilisation de `/report/integrated/get/` et d’un mode asynchrone `/report/task/create/`, avec des dimensions et métriques soumises aux combinaisons supportées. Certains anciens endpoints de rapport sont dépréciés. M2L doit donc versionner les adaptateurs et ne pas figer les métriques dans le modèle métier.

    Les rapports sont asynchrones ou paginés, soumis aux limites de débit et susceptibles de différer d’un écran Ads Manager selon attribution, fuseau, devise et période. Le dashboard doit afficher la période, le fuseau, la date de dernière synchronisation et la source.

    ## Paiements

    Les méthodes de paiement sont configurées dans Ads Manager/Business Center. M2L ne doit ni saisir ni conserver ces données. M2L peut afficher un état « paiement à vérifier » et un seuil de dépense, mais la confirmation financière reste dans TikTok.

    ## Sources officielles

    - [Marketing API — portail officiel](https://ads.tiktok.com/gateway/docs/index)
    - [Autorisation annonceur](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378)
    - [API for Business / Marketing API](https://ads.tiktok.com/resources/help/article/marketing-api?lang=en)
    - [Structure campagne / ad group](https://ads.tiktok.com/gateway/docs/index?doc_id=1739381193120770)
    - [Versioning, reporting et dépréciations](https://ads.tiktok.com/gateway/docs/index?doc_id=1740579480076290)
    - [Configuration d’un compte publicitaire](https://ads.tiktok.com/resources/help/article/account-setup-faq)
    - [Moyens de paiement Ads Manager](https://ads.tiktok.com/resources/help/article/add-a-payment-method-for-automatic-payment-in-tiktok-ads-manager)

    ## Validation réelle avant engagement

    Obtenir l’accès développeur et exécuter un parcours de lecture puis de création désactivée/test. Valider les scopes réellement disponibles, le marché, les formats, les objectifs, les rapports et les limites QPS sur les comptes clients cibles. Toute fonctionnalité absente du portail ou non testée reste « non engagée ».
