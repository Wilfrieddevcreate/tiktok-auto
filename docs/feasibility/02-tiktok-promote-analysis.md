# Analyse spécifique — TikTok Promote et Coins

**Date de vérification : 9 novembre 2026**

## Nature de Promote

Promote est un outil de promotion intégré à TikTok. La documentation officielle le décrit comme un moyen d’amplifier des vidéos et des LIVE, avec des objectifs tels que vues, abonnés, visites de profil, prospects, visites/conversions de site ou ventes selon le contexte.

Promote n’est pas automatiquement équivalent à une campagne créée dans Ads Manager. Son compte, ses ordres, ses soldes et son parcours de paiement doivent être modélisés séparément.

## Éligibilité

Les conditions varient selon la fonctionnalité, le pays, le type de compte, l’âge, le contenu et la conformité. La documentation indique notamment que l’utilisateur doit avoir au moins 18 ans ; pour promouvoir un LIVE, elle indique un seuil de 1 000 abonnés. Les contenus promus doivent respecter les règles communautaires et publicitaires. Les pages d’aide indiquent aussi des contraintes de visibilité du post et de musique commerciale selon les marchés.

**Constat d’audit :** aucune API publique documentée permettant de demander « ce compte/cette vidéo est-elle éligible à Promote ? » n’a été identifiée. L’éligibilité doit donc être considérée comme une observation humaine dans l’application/web TikTok, avec capture de preuve et date, pas comme une propriété automatiquement garantie par M2L.

## Coins et moyens de paiement

Les Coins sont des éléments virtuels TikTok. Ils peuvent être achetés par les surfaces TikTok et, selon le pays, par l’App Store, Google Play ou le site TikTok. Les moyens de paiement et frais peuvent varier selon la localisation et la plateforme.

La documentation Promote mentionne l’utilisation de Coins, cartes, comptes bancaires, cartes cadeaux, e-wallets, solde Promote ou solde Ads Manager après intégration. Cela ne constitue pas une API de paiement exploitable par M2L.

**Décision :** M2L ne doit pas stocker de carte, CVV, compte bancaire, identifiant d’App Store/Google Play, cookie de session ni mot de passe TikTok. Un VA ou un responsable autorisé réalise le paiement dans la surface TikTok ; M2L enregistre uniquement un statut, un montant déclaré, une devise, un justificatif et un identifiant de rapprochement non sensible.

## Lancement et statistiques

Les pages officielles décrivent la création et le suivi dans l’interface Promote. L’intégration avec TikTok Ads Manager peut, si le compte est éligible et les conditions remplies, permettre de voir ou gérer davantage d’éléments dans Ads Manager. Cette intégration nécessite notamment un compte TikTok lié à TikTok for Business et des conditions de solde/commandes.

Il n’est pas prudent de promettre que toutes les promotions Promote pourront être créées, modifiées, arrêtées ou lues depuis la Marketing API. La plateforme doit donc prévoir :

1. une action « À vérifier dans TikTok » ;
2. un formulaire de retour opérateur ;
3. import manuel/export lorsque disponible ;
4. rapprochement séparé des coûts Promote et du spend Ads Manager ;
5. un champ `source = PROMOTE_UI | ADS_MANAGER | API | MANUAL` pour chaque mesure.

## Ce que M2L peut intégrer sans surpromesse

- inventaire des profils et contenus ;
- checklist d’éligibilité déclarative, jamais présentée comme verdict TikTok ;
- tâche VA avec approbation et séparation des rôles ;
- lien profond vers l’étape Promote ;
- saisie contrôlée du statut, budget, durée et résultat ;
- stockage de justificatifs non sensibles ;
- dashboard distinct « Promote déclaré » vs « Ads Manager synchronisé ».

## Sources et tests requis

- [About Promote](https://ads.tiktok.com/resources/help/article/about-promote-on-tiktok?lang=en)
- [Supported methods of payment for Promote](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en)
- [Promote / Ads Manager integration](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager?lang=en)
- [Coins and Gifts](https://support.tiktok.com/en/live-gifts-wallet/gifts/gifts)
- [Promouvoir une marque, un produit ou un service](https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/promoting-a-brand-product-or-service)

Test réel indispensable sur chaque marché cible : deux comptes de test, un post public, un post avec son non commercial, un compte non éligible, un paiement via le parcours autorisé et une promotion liée ou non à Ads Manager. Aucun test ne doit utiliser de fausses identités ni de moyens de paiement sans autorisation.
