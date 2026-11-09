# M2L — Audit final de faisabilité

**Vérification documentaire : 9 novembre 2026**  
**Périmètre :** TikTok Promote, TikTok Content Posting API et TikTok Ads Manager/Marketing API.  
**Statut :** analyse uniquement ; aucun développement applicatif.

## Résumé de décision

Le projet est **GO sous conditions** pour une plateforme d’orchestration, de suivi et de reporting. Il n’est pas validé pour une automatisation complète du cycle « création de centaines de comptes → achat de Coins → lancement de Promote ».

La frontière déterminante est la suivante :

- **Content Posting API** : permet de publier sur un profil TikTok autorisé, avec scopes, consentement et audit requis selon le mode.
- **TikTok Promote** : fonctionnalité de promotion depuis l’écosystème TikTok, avec éligibilité, paiement et Coins pilotés par les surfaces TikTok. Aucune API publique officielle dédiée à l’achat de Coins, à la vérification d’éligibilité ou au lancement de Promote n’a été trouvée dans les documentations officielles consultées.
- **Marketing API** : permet de gérer les actifs TikTok Ads Manager exposés par l’API, après autorisation de chaque annonceur. Elle ne doit pas être assimilée à une API Promote/Coins.

## Audit par fonctionnalité

| Fonctionnalité | Faisabilité | API officielle identifiée | Humain | Risque |
|---|---|---|---|---|
| Créer des comptes TikTok | Non garanti, hors API documentée | Aucune API publique identifiée | Oui | Très élevé si industrialisé par contournement |
| Préparer/warm-up des comptes | Non automatisable comme tel | Aucune API « warm-up » | Oui, selon règles TikTok | Élevé : comportement artificiel/spam |
| Publier des vidéos | Oui, profils autorisés | Content Posting API | Consentement ; revue selon mode | Moyen à élevé |
| Publier publiquement | Oui sous conditions | `video.publish` | Autorisation + audit | Élevé si client non audité |
| Vérifier l’éligibilité Promote | Non confirmée par API publique | Surface Promote TikTok | Oui | Élevé si décision automatisée supposée |
| Acheter des Coins | Non identifié | Surfaces TikTok/app stores/web selon pays | Oui | Très élevé : paiements et comptes |
| Lancer une promotion Promote | Non confirmé par API publique | Promote app/web ; intégration Ads Manager selon éligibilité | Oui | Élevé |
| Lire les données Promote | Non confirmé par API publique dédiée | Dashboard Promote/TikTok ; éventuellement Ads Manager après intégration | Oui pour collecte alternative | Moyen |
| Gérer campagnes Ads Manager | Oui, capacités exposées | Marketing API | Approbation recommandée | Élevé car dépenses réelles |
| Gérer plusieurs annonceurs | Oui sous autorisations séparées | OAuth Marketing API | Autorisation de chaque annonceur | Élevé : isolation multi-tenant |
| Paiements Ads Manager | Partiel | Gestion dans Ads Manager/Business Center | Oui | Très élevé |
| KPI Ads Manager | Oui pour rapports documentés | `report/integrated/get` et rapports async | Non, après connexion | Moyen |

## Ce qui est techniquement défendable

M2L peut fournir un registre de comptes, un workflow VA, une connexion Content Posting API, un calendrier de publications, une synchronisation Marketing API, des rapports et un tableau de bord. M2L peut aussi guider l’opérateur vers TikTok pour les étapes Promote non exposées.

M2L ne doit pas simuler un utilisateur dans l’application, automatiser un navigateur avec des identifiants ou contourner une vérification, un bannissement ou un contrôle de paiement. Ces solutions ne constitueraient pas une intégration officielle et exposeraient l’agence à la suspension et à un risque contractuel.

## Sources officielles consultées

- [API for Business — Marketing API](https://ads.tiktok.com/gateway/docs/index)
- [Autorisation Marketing API](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378)
- [About Promote](https://ads.tiktok.com/resources/help/article/about-promote-on-tiktok?lang=en)
- [Paiements Promote](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en)
- [Intégration Promote / Ads Manager](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager?lang=en)
- [Content Posting API — Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- [Content Posting API — Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video)
- [Scopes](https://developers.tiktok.com/docs/en/tiktok-api-scopes)
- [Support TikTok — Coins](https://support.tiktok.com/en/live-gifts-wallet/gifts/gifts)

**À confirmer par test réel :** disponibilité par pays, type de compte, âge, plateforme, devise, droits de profil, apparition de Promote, intégration Promote/Ads Manager et métriques effectivement exposées pour le compte cible.
