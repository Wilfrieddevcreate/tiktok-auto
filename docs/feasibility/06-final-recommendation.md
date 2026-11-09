# Recommandation finale

**Date : 9 novembre 2026**  
**Décision : GO SOUS CONDITIONS**

## Tableau final

| Fonctionnalité | Faisabilité | API disponible | Intervention humaine | Risque |
|---|---|---|---|---|
| Créer des comptes TikTok en masse | Non engagée | Non identifiée | Obligatoire | Critique |
| Warm-up/préparation automatisée | Non recommandée | Non identifiée | Obligatoire | Critique |
| Publier une vidéo | Oui | Content Posting API | Consentement ; audit selon mode | Élevé |
| Publier publiquement | Oui sous audit | `video.publish` | Oui pour autorisation | Élevé |
| Vérifier l’éligibilité Promote | Non automatisée | Non identifiée | Obligatoire | Élevé |
| Acheter des Coins | Non intégré | Aucune API publique identifiée | Obligatoire | Critique |
| Payer Promote | Non intégré | Parcours TikTok/app store/web | Obligatoire | Critique |
| Lancer Promote | Non garanti | API Promote dédiée non identifiée | Obligatoire | Élevé |
| Consulter Promote | Partiel/manuel | Dashboard TikTok ; intégration Ads Manager selon compte | Oui | Moyen/Élevé |
| Créer des campagnes Ads Manager | Oui sous permissions | Marketing API | Approbation recommandée | Élevé |
| Gérer plusieurs annonceurs | Oui sous autorisations | OAuth Marketing API | Autorisation par annonceur | Élevé |
| Lire KPI Ads Manager | Oui pour données exposées | Reporting Marketing API | Non après connexion | Moyen |
| Gérer paiements Ads Manager | Partiel | Surface Ads Manager/Business Center | Obligatoire | Critique |

## Ce que nous pouvons garantir au client

- Une plateforme de centralisation des comptes autorisés, tâches, publications, rapports et preuves d’opérations.
- Une intégration officielle Content Posting API, sous réserve des scopes et audits TikTok.
- Une intégration officielle Marketing API pour les comptes annonceurs autorisés et les ressources exposées.
- Une séparation fiable entre Coins/Promote et dépenses Ads Manager.
- Des workflows VA, validations humaines, journalisation, RBAC, limites de dépense et alertes.
- Un fonctionnement évolutif vers plusieurs centaines de connexions si TikTok autorise les comptes et si les quotas sont respectés.

## Ce qu’il faut tester avant de s’engager

- apparition réelle de Promote sur les comptes/marchés ciblés ;
- éligibilité de vidéos réelles après publication ;
- parcours Coins et paiement autorisé sans automatisation ;
- possibilité de relier Promote à Ads Manager ;
- métriques accessibles et rapprochement avec les écrans TikTok ;
- scopes Content Posting et Marketing API réellement approuvés ;
- limites, délais, erreurs et comportement sur dizaines de comptes ;
- traitement des révisions, suspensions, révo­cations et remboursements.

## Ce que nous ne devons pas promettre

- la création ou la vérification automatisée de centaines de comptes TikTok ;
- un warm-up automatique destiné à rendre des comptes éligibles ;
- la détection API universelle de l’éligibilité Promote ;
- l’achat automatique de Coins ou la saisie de cartes bancaires ;
- le lancement automatique de toutes les promotions Promote ;
- la levée d’un bannissement ou d’une revue TikTok ;
- une publication publique avant audit Content Posting ;
- une disponibilité ou des KPI identiques dans tous les pays et types de comptes.

## Questions à poser au client

1. Dans quels pays, devises et fuseaux les comptes seront-ils opérés ?
2. Le client possède-t-il légalement chaque compte et dispose-t-il d’une preuve de propriété ?
3. Combien de comptes existent déjà et combien doivent être créés manuellement ?
4. Le client accepte-t-il un workflow humain pour l’éligibilité, les Coins, paiements et Promote ?
5. Quel est le rôle exact des VA et qui peut approuver une dépense ?
6. Quel budget maximal par compte, jour, client et organisation faut-il imposer ?
7. Les comptes sont-ils personnels, créateurs, Business, gouvernementaux ou liés à TikTok Shop ?
8. Les contenus disposent-ils des droits musicaux et commerciaux requis ?
9. Les promotions doivent-elles rester Promote ou peuvent-elles être migrées vers Ads Manager ?
10. Quels KPI sont indispensables et quelle source fait foi en cas de divergence ?
11. Les clients annonceurs autoriseront-ils séparément l’application Marketing API ?
12. Le client accepte-t-il les délais et l’incertitude des audits TikTok ?
13. Quelles données justificatives peuvent être stockées et combien de temps ?
14. Quelle procédure appliquer en cas de suspension, paiement refusé ou compte compromis ?
15. Quel niveau de disponibilité et de support humain est attendu pour les opérations sensibles ?

## Conclusion commerciale

Signer uniquement un périmètre de **plateforme d’opérations assistées et d’intégrations officielles**. Le développement doit commencer par le MVP de validation. Le scénario Promote/Coins doit être vendu comme un workflow humain contrôlé, non comme une API automatisée. La décision de généralisation à plusieurs centaines de comptes doit être prise après preuves de test, autorisations TikTok et validation du modèle opérationnel.

### Sources officielles

- [Marketing API](https://ads.tiktok.com/gateway/docs/index)
- [Autorisation Marketing API](https://ads.tiktok.com/gateway/docs/index?doc_id=1738373141733378)
- [About Promote](https://ads.tiktok.com/resources/help/article/about-promote-on-tiktok?lang=en)
- [Paiements Promote](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en)
- [Intégration Promote / Ads Manager](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager?lang=en)
- [Content Posting API](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- [Scopes Content Posting](https://developers.tiktok.com/docs/en/tiktok-api-scopes)
