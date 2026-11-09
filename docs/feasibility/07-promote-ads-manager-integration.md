# Audit complémentaire — TikTok Promote × Ads Manager × Marketing API

**Date de vérification : 9 novembre 2026**  
**Périmètre :** intégration officielle Promote ↔ TikTok Ads Manager, puis éventuelle exposition par la Marketing API.  
**Statut :** analyse documentaire et plan de validation ; aucun développement.

## 1. Conclusion exécutive

L’intégration officielle existe au niveau des produits TikTok : un compte utilisant Promote peut être relié à un compte TikTok Ads Manager lorsque TikTok affiche l’éligibilité. TikTok documente alors la présence des campagnes/orders Promote dans Ads Manager, la consultation et la gestion de certains détails, le reporting unifié dans l’interface et le partage de fonds.

En revanche, la documentation publique consultée ne démontre pas que ces campagnes Promote sont exposées comme ressources ordinaires et entièrement pilotables par la **Marketing API**. Elle ne documente pas non plus un endpoint dédié permettant d’identifier, créer, modifier, mettre en pause ou arrêter un order Promote. La présence d’une campagne dans l’interface Ads Manager ne suffit donc pas à conclure qu’elle est disponible dans `/report/integrated/get/` ou dans les endpoints de gestion.

**Décision : GO SOUS CONDITIONS** pour une centralisation hybride : API officielle pour les ressources Ads Manager confirmées, interface TikTok pour les étapes Promote non confirmées, rapprochement humain/API et séparation stricte des comptes et fonds. **NO-GO** pour promettre l’automatisation complète de Promote via Marketing API avant un test pilote accepté par TikTok.

## 2. Niveau de preuve utilisé

- **Documenté API :** l’endpoint, la ressource, le scope et le comportement sont explicitement décrits dans la documentation API.
- **Documenté interface :** TikTok décrit la capacité dans Ads Manager ou Promote, mais pas son contrat API.
- **Possible mais non vérifié :** la documentation laisse une possibilité, mais aucun endpoint/réponse/compte pilote ne la confirme.
- **Non documenté / non engagé :** aucune preuve officielle exploitable ; M2L ne doit pas le vendre ni l’implémenter par contournement.

La date de vérification de toutes les conclusions ci-dessous est le **9 novembre 2026**. Les pages TikTok évoluent ; un test réel et une vérification du portail développeur restent nécessaires avant engagement commercial.

## 3. Réponse aux questions obligatoires

### 3.1 Peut-on relier plusieurs comptes TikTok Promote à un ou plusieurs comptes Ads Manager ?

**Réponse : partiellement documenté, cardinalité non confirmée.**

TikTok documente le rattachement d’un compte Promote à un compte Ads Manager existant, ou la création d’un compte Ads Manager lorsque le compte TikTok n’en possède pas. Le parcours permet de sélectionner un compte existant par nom et identifiant lorsqu’il est proposé.

La page officielle ne spécifie pas une règle de cardinalité pour une agence : elle ne garantit ni le many-to-one de plusieurs comptes TikTok Promote vers un compte Ads Manager, ni le many-to-many vers plusieurs comptes Ads Manager. Elle ne décrit pas non plus un mécanisme d’API pour administrer ces liaisons.

**Conséquence M2L :** modéliser chaque liaison observée comme un objet indépendant et interdire toute hypothèse de partage. Un pilote doit tester :

1. deux profils TikTok Promote vers un même compte Ads Manager ;
2. un profil vers deux comptes Ads Manager si l’interface le propose ;
3. deux clients M2L distincts avec des Business Centers distincts ;
4. le retrait de la liaison et la conservation des données historiques.

### 3.2 Conditions d’éligibilité et restrictions géographiques

**Réponse : conditions documentées ; liste géographique exhaustive non publiée dans les pages vérifiées.**

Pour commencer l’intégration, TikTok documente les prérequis suivants :

- solde Promote égal à zéro ;
- aucune commande non terminée ;
- aucune commande impayée ;
- aucune demande de remboursement en cours ;
- compte TikTok lié à un compte TikTok for Business ;
- éligibilité affichée dans l’application, par une notification ou une section de guidance de l’ordre Promote.

TikTok indique que les informations business et billing sont synchronisées, et qu’un compte Ads Manager peut être créé dans le parcours. Les documents de paiement indiquent par ailleurs que les méthodes et frais dépendent de la localisation et de la plateforme. Aucun tableau public exhaustif des pays, devises, types de compte et conditions régionales de l’intégration n’a été trouvé dans les sources officielles vérifiées.

**Statut :** les restrictions géographiques et commerciales doivent être testées par marché ; elles ne peuvent pas être déduites de la disponibilité générale de Promote.

### 3.3 Quelles opérations sont possibles dans Ads Manager après intégration ?

**Documenté dans l’interface :**

- voir des campagnes Promote dans Ads Manager ;
- voir leurs détails d’ordre, notamment budget, période et performance ;
- gérer ces campagnes depuis Ads Manager selon les capacités affichées ;
- voir davantage de campagnes dans une gestion consolidée ;
- accéder au reporting et aux recommandations Ads Manager ;
- gérer des budgets au niveau ad group et utiliser Campaign Budget Optimization selon l’éligibilité ;
- accéder à des fonctions de ciblage, Pixel, Spark Ads et outils créatifs pour les capacités compatibles ;
- utiliser un pool de fonds partagé entre Ads Manager et Promote.

La page ne fournit pas une matrice opérationnelle exhaustive indiquant, pour chaque campagne Promote, si l’édition du budget, de la période, du ciblage, du statut ou de l’objectif est disponible. Elle ne fournit pas non plus la correspondance entre ces actions d’interface et les endpoints Marketing API.

**Conclusion :** « gérable dans l’interface » est confirmé ; « gérable par API » reste à démontrer par endpoint et test.

### 3.4 Les campagnes Promote intégrées sont-elles accessibles via Marketing API ?

**Réponse : non confirmé par la documentation publique.**

La documentation API for Business décrit la Marketing API comme une API de gestion et de reporting des fonctionnalités Ads Manager. Elle ne précise pas que les orders Promote synchronisés sont une ressource API distincte, ni qu’ils sont retournés par les endpoints de campagne/ad group/ad.

La documentation d’intégration Promote confirme la synchronisation vers Ads Manager, mais ne mentionne ni `advertiser_id` exploitable par la Marketing API pour chaque order Promote, ni un champ de provenance garanti, ni un endpoint Promote dans l’API.

M2L doit donc classer cette capacité **non engagée** jusqu’à obtention d’une preuve sur un compte pilote : réponse JSON officielle, endpoint documenté, scope autorisé et résultat reproductible.

### 3.5 Peut-on lire budgets, périodes, statuts et performances via API ?

**Interface : oui, documenté. API : non confirmé.**

TikTok indique explicitement que les détails du Promote order, dont le budget, la période et la performance, peuvent être vus et gérés dans Ads Manager. Cela prouve l’existence de ces données dans le produit, pas leur disponibilité dans `/report/integrated/get/`.

Pour l’API, il faut distinguer :

- **budget/période/statut de la ressource :** vérifier dans les endpoints de campagne/ad group/ad et les champs retournés ;
- **performance :** vérifier dans `report/integrated/get/` ou le mécanisme de rapport asynchrone ;
- **source Promote :** vérifier l’existence d’un identifiant ou d’un champ de provenance ;
- **coût et facturation :** vérifier séparément les données de paiement/transaction, sans les confondre avec les métriques publicitaires.

Sans ces quatre preuves, M2L doit afficher ces valeurs comme « interface uniquement » ou « non synchronisées », jamais comme données API garanties.

### 3.6 Peut-on créer, modifier, mettre en pause ou arrêter ces campagnes via API ?

**Réponse : non documenté pour Promote.**

La Marketing API documente la création et la gestion de ressources Ads Manager classiques, mais les sources vérifiées ne documentent pas les verbes de commande appliqués aux Promote orders intégrés. La page d’intégration indique une gestion dans Ads Manager, sans contrat API correspondant.

Les actions suivantes sont donc classées **non engagées par API** : création d’un order Promote, modification de son budget ou de sa période, mise en pause, reprise, arrêt, remboursement ou suppression. Elles ne pourront être intégrées qu’après validation d’un endpoint officiel et d’un test sans risque financier.

### 3.7 Les campagnes Promote apparaissent-elles dans `/report/integrated/get/` ?

**Réponse : non confirmé.**

La documentation Marketing API présente `/report/integrated/get/` comme endpoint de rapports intégrés pour les données publicitaires documentées. Elle ne dit pas que les campagnes Promote synchronisées sont incluses, ni comment les filtrer.

Le seul résultat acceptable pour engager cette capacité serait un test sur une campagne Promote connue :

1. récupérer son identifiant dans Ads Manager ;
2. interroger `/report/integrated/get/` avec les dimensions et métriques autorisées ;
3. retrouver une ligne non ambiguë ;
4. rapprocher coût, impressions, clics et période avec Ads Manager ;
5. répéter après modification et fin de campagne.

En l’absence de ce test, la réponse est **« non vérifié »**, pas « oui ».

### 3.8 Peut-on distinguer Promote des campagnes Ads Manager classiques dans les rapports ?

**Réponse : non garanti.**

Les sources vérifiées ne documentent pas un champ API universel `source=promote`, un type de campagne ou un filtre dédié dans `report/integrated/get/`. Si les lignes sont retournées sans marqueur de provenance, M2L ne pourra pas distinguer de manière fiable Promote d’une campagne classique par simple inférence du nom.

Le modèle doit prévoir :

- `origin = PROMOTE | ADS_MANAGER | UNKNOWN` ;
- `origin_confidence = DOCUMENTED | PILOT_VERIFIED | MANUAL | UNKNOWN` ;
- identifiants TikTok séparés pour order, campaign, ad group et ad ;
- preuve de rattachement conservée ;
- absence de reclassement automatique fondé uniquement sur un nom ou un budget.

### 3.9 Les fonds Ads Manager peuvent-ils financer Promote ?

**Réponse : oui dans l’interface, sous conditions ; API de financement non confirmée.**

TikTok documente le partage de pools de fonds entre Ads Manager et Promote et indique qu’après intégration, le solde Ads Manager peut financer une campagne Promote. Le parcours d’intégration impose notamment un solde Promote nul et l’absence de commandes impayées/non terminées/remboursements en cours. Les informations de billing doivent être complétées ou alignées.

Cela ne signifie pas que M2L peut transférer des fonds ou déclencher un paiement via Marketing API. Les opérations financières restent dans les surfaces TikTok, avec rôles financiers, vérifications et restrictions de marché. M2L ne stocke aucun moyen de paiement.

### 3.10 L’intégration supprime-t-elle le besoin d’acheter des Coins ?

**Réponse : pas universellement.**

Pour un compte effectivement éligible et correctement intégré, TikTok documente le paiement d’une campagne Promote avec le solde Ads Manager. Cela peut supprimer l’usage des Coins pour ce parcours précis.

Il ne faut pas conclure que :

- tous les comptes sont éligibles à l’intégration ;
- tous les pays ou plateformes disposent du même mode de paiement ;
- les Coins deviennent inutiles pour toutes les opérations Promote ;
- un compte non intégré peut utiliser le solde Ads Manager ;
- M2L peut automatiser la conversion ou le transfert de fonds.

La règle commerciale doit être : **Coins requis ou autre paiement TikTok tant que l’intégration effective et le financement Ads Manager n’ont pas été constatés sur le compte concerné**.

### 3.11 Comment isoler plusieurs clients M2L ?

L’intégration ne résout pas le problème de gouvernance multi-client. M2L doit appliquer une isolation stricte :

- un tenant M2L par client juridique ou organisation contractuelle ;
- association explicite `client → TikTok profile → Promote link → Business Center → advertiser_id` ;
- aucun partage implicite de tokens, fonds, moyens de paiement ou queues ;
- permissions et rôles évalués au niveau du compte annonceur ;
- budget, devise, fuseau et facturation stockés par compte ;
- rapports filtrés par `advertiser_id` et tenant, jamais seulement par nom de campagne ;
- approbation humaine avec plafond par client ;
- journal d’audit pour chaque liaison, autorisation, ordre, synchronisation et action financière ;
- révocation et purge indépendantes par client.

Le même Business Center peut éventuellement gérer plusieurs actifs, mais M2L ne doit pas en déduire que les fonds ou les droits sont interchangeables. L ownership, les rôles financiers et les autorisations doivent être confirmés dans chaque compte.

### 3.12 Quelles opérations restent obligatoirement humaines ?

À ce stade :

- obtenir ou vérifier l’éligibilité d’un compte à l’intégration Promote ;
- accepter les conditions et autoriser la liaison TikTok/Ads Manager ;
- renseigner ou corriger les informations business et billing ;
- effectuer les paiements, top-ups, retraits, remboursements ou validations bancaires ;
- acheter des Coins si le compte n’utilise pas le financement Ads Manager ;
- confirmer l’éligibilité d’un post Promote et son respect des politiques ;
- traiter une revue, un refus, une suspension ou une limitation ;
- valider toute action pouvant déclencher une dépense réelle si l’API correspondante n’est pas prouvée ;
- arbitrer une divergence entre interface Promote, Ads Manager et API.

## 4. Parcours de référence

```text
Profil TikTok + post éligible
          |
          v
Promote (éligibilité affichée dans TikTok)
          |
          | liaison officielle si compte éligible,
          | solde Promote = 0, commandes réglées,
          | compte lié à TikTok for Business
          v
TikTok Ads Manager / Business Center
          |
          | interface : ordres Promote, budget, période,
          | performances, gestion et pool de fonds partagé
          |
          +------------------------------+
          |                              |
          v                              v
Marketing API                        Paiements TikTok
preuve à établir                     interface/roles financiers
          |
          | vérifier ressources, reports,
          | provenance et mutations
          v
M2L : adaptateur API + rapprochement manuel
          |
          v
Dashboard séparant Promote / Ads Manager / source inconnue
```

Le flux en pointillé conceptuel est volontaire : la documentation confirme la présence dans l’interface Ads Manager, mais pas l’exposition complète par Marketing API.

## 5. Tableau de faisabilité

| Capacité | Classe de preuve | Faisabilité M2L | API Marketing confirmée ? | Intervention humaine | Décision |
|---|---|---:|---:|---:|---|
| Relier un compte Promote à Ads Manager | Interface officiellement documentée | Oui, si éligible | Non | Oui | Pilote requis |
| Relier plusieurs profils à un compte | Non spécifié | Possible mais non vérifié | Non | Oui | Ne pas garantir |
| Relier un profil à plusieurs comptes | Non spécifié | Non vérifié | Non | Oui | Hors promesse |
| Voir Promote dans Ads Manager | Interface officiellement documentée | Oui | Non déduit | Oui au setup | Validé interface |
| Lire budget/période/performance | Interface documentée | Oui dans Ads Manager | Non confirmé | Oui si API absente | Pilote requis |
| Créer un Promote order via API | Non documenté | Non engagée | Non | Oui | Hors MVP |
| Modifier/pauser/arrêter via API | Non documenté | Non engagée | Non | Oui | Hors promesse |
| Retrouver Promote dans `report/integrated/get` | Non confirmé | À tester | Non confirmé | Oui pour contrôle | Bloquant |
| Distinguer Promote/classique par API | Non confirmé | À tester | Non confirmé | Oui pour preuve | Bloquant |
| Financer Promote par solde Ads Manager | Interface officiellement documentée | Oui sous conditions | Non confirmé | Oui | Validé interface |
| Supprimer universellement les Coins | Non | Non | Non | Oui selon compte | Impossible à garantir |
| Isoler plusieurs clients M2L | Architecture M2L | Oui | N/A | Gouvernance humaine | Obligatoire |

## 6. Tests réels sur un compte pilote

Le pilote doit être réalisé avec l’autorisation explicite du propriétaire, un compte publicitaire de test et un budget plafonné.

### Préparation

1. Choisir un marché et une plateforme (web, Android ou iOS) documentés par le client.
2. Vérifier identité, type de compte, région, devise, fuseau et lien TikTok for Business.
3. Vérifier solde Promote nul, absence d’ordre impayé/non terminé et absence de remboursement.
4. Capturer l’éligibilité ou l’absence d’éligibilité affichée dans Promote.
5. Créer la liaison vers un Ads Manager existant sans partager de moyen de paiement avec un autre client.

### Tests de lecture interface/API

6. Créer une promotion de très faible montant depuis Promote, avec approbation humaine.
7. Relever order ID, campaign ID, ad group ID, budget, période, statut et métriques dans Promote et Ads Manager.
8. Interroger les endpoints Marketing API autorisés pour l’advertiser ID.
9. Tester `report/integrated/get/` avec les dimensions/métriques compatibles et rechercher la promotion par identifiants.
10. Comparer les résultats à plusieurs instants : avant diffusion, actif, pause/fin, éventuel remboursement.
11. Vérifier un champ de provenance ou une méthode fiable de classification Promote.
12. Documenter les différences d’arrondi, fuseau, attribution, délai et devise.

### Tests de gestion et de paiement

13. Tester dans Ads Manager les actions affichées : modification budget/période, pause, reprise, arrêt.
14. Pour chaque action, rechercher un endpoint API officiel correspondant ; à défaut, ne pas automatiser.
15. Vérifier que le solde Ads Manager finance l’ordre Promote après intégration.
16. Vérifier le comportement des Coins : solde, impossibilité ou nécessité d’achat, remboursement et retrait selon le marché.
17. Confirmer que M2L ne voit jamais le numéro de carte, CVV, compte bancaire ou token de session.

### Tests multi-client

18. Répéter avec deux clients et deux `advertiser_id` distincts.
19. Vérifier qu’un token, rapport, fonds ou ordre n’apparaît jamais dans l’autre tenant.
20. Révoquer une liaison et confirmer l’arrêt des jobs, la purge du token et l’audit.

**Critère de preuve :** une capture d’interface ne valide pas l’API. Pour classer une capacité comme API confirmée, conserver la documentation de l’endpoint, la requête, la réponse JSON, les scopes, l’identifiant de compte et une comparaison avec Ads Manager.

## 7. Conséquences architecture et modèle de données

### Architecture

Ajouter un module distinct `PromoteIntegration` mais sans client API fictif :

- `PromoteLinkService` : état de la liaison et éligibilité observée ;
- `PromoteManualWorkflow` : tâches VA, approbations, preuves et statuts ;
- `MarketingApiAdapter` : uniquement endpoints officiellement documentés ;
- `PromoteReconciliation` : rapprochement des valeurs saisies/interface avec API ;
- `FundsBoundary` : contrôle empêchant de confondre Coins, Promote balance et Ads Manager balance.

Les queues doivent être partitionnées par tenant et `advertiser_id`. Les opérations financières exigent idempotence, plafond et approbation. Socket.IO peut diffuser un statut, mais la source de vérité est PostgreSQL.

### Modèle de données à ajouter

- `PromoteLink(id, client_id, tiktok_profile_id, advertiser_account_id, status, eligibility_source, eligibility_observed_at, region, platform)`
- `PromoteOrder(id, promote_link_id, external_order_id, external_campaign_id, origin, origin_confidence, budget, currency, start_at, end_at, status, source)`
- `PromotePayment(id, promote_order_id, method_type, amount, currency, performed_by, external_reference, proof_ref)` — sans données carte/bancaires ;
- `PromoteMetricSnapshot(id, promote_order_id, source, period_start, period_end, metrics_json, observed_at)`
- `AccountFundBoundary(id, advertiser_account_id, fund_type, currency, balance_observed, observed_at)`
- `ReconciliationCase(id, tenant_id, entity_type, local_value, tiktok_value, source, status, reviewer_id)`.

Les champs `origin` et `source` doivent accepter `PROMOTE_UI`, `ADS_MANAGER_UI`, `MARKETING_API`, `MANUAL`, `UNKNOWN`. Ne pas déduire automatiquement `PROMOTE` d’un nom de campagne.

### Modèle économique

Le devis M2L doit distinguer :

- intégration Content Posting/Marketing API ;
- orchestration et reporting ;
- opérations VA Promote et paiement ;
- rapprochement manuel des performances ;
- frais d’audit, revue ou support TikTok, qui sont externes et sans délai garanti.

Ne pas facturer une garantie d’automatisation Promote sur la base de la seule page d’intégration Ads Manager. Prévoir un palier commercial : MVP de preuve, puis option d’automatisation uniquement pour les endpoints effectivement confirmés.

## 8. Sources officielles vérifiées

- [About Promote integration with TikTok Ads Manager](https://ads.tiktok.com/resources/help/article/about-promote-integration-with-tiktok-ads-manager?lang=en) — dernière mise à jour indiquée : juin 2026.
- [How to integrate Promote with TikTok Ads Manager](https://ads.tiktok.com/resources/help/article/how-to-integrate-promote-with-tiktok-ads-manager) — dernière mise à jour indiquée : juillet 2026.
- [Supported methods of payment for Promote](https://ads.tiktok.com/resources/help/article/supported-methods-of-payment-for-promote?lang=en) — dernière mise à jour indiquée : septembre 2025.
- [About Promote on TikTok](https://ads.tiktok.com/resources/help/article/about-promote-on-tiktok?lang=en) — dernière mise à jour indiquée : juillet 2026.
- [About API for Business](https://ads.tiktok.com/resources/help/article/marketing-api?lang=en&redirected=2) — dernière mise à jour indiquée : septembre 2025.
- [Marketing API — portail développeur](https://ads.tiktok.com/gateway/docs/index).
- [How to see ad performance in Ads Manager](https://ads.tiktok.com/resources/help/article/view-data) — page consultée le 9 novembre 2026.
- [TikTok Ads Manager / Business Center payment management](https://ads.tiktok.com/resources/help/article/learn-the-basic-operations-of-bc-and-complete-the-basic-bc-settings?lang=en).

## 9. Décision finale

**GO SOUS CONDITIONS** pour :

- relier les comptes lorsque TikTok expose l’éligibilité ;
- centraliser les liaisons, tâches humaines, preuves et données confirmées ;
- utiliser Marketing API pour Ads Manager selon les endpoints réellement autorisés ;
- tester l’exposition des Promote orders dans les rapports avant toute promesse.

**NO-GO** pour :

- promettre plusieurs centaines de comptes Promote reliés sans test de cardinalité ;
- prétendre que toute campagne visible dans Ads Manager est accessible par Marketing API ;
- automatiser la création, pause, arrêt ou facturation Promote sans endpoint officiel confirmé ;
- supprimer universellement les Coins de l’opération ;
- utiliser scraping, automatisation de navigateur, session utilisateur ou contournement.
