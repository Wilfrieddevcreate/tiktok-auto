# Périmètre produit définitif du MVP

**Date de référence : 9 novembre 2026**  
**Statut :** dossier de conception, sans développement.

## Décision de périmètre

Le MVP est une plateforme interne multi-tenant d’orchestration et de contrôle humain. Il couvre trois domaines strictement séparés :

| Domaine | Statut MVP | Source de vérité |
|---|---|---|
| Publication organique | À tester / manuelle selon flux | Content Posting API + TikTok |
| Publicité Ads Manager | À tester, puis confirmée par endpoint | Marketing API + Ads Manager |
| Promote | Manuelle | Promote/Ads Manager UI ; API non confirmée |

## Inclus

- organisations, clients, utilisateurs et rôles ;
- connexions OAuth TikTok séparées par produit ;
- profils TikTok autorisés ;
- comptes annonceurs autorisés ;
- liaison Promote observée et workflow VA ;
- préparation et validation de contenu ;
- publication vidéo en `video.upload` ou `video.publish` avec statuts distincts ;
- synchronisation en lecture des ressources Ads Manager documentées ;
- rapports Marketing API après test réel ;
- saisie et rapprochement manuel des opérations Promote ;
- audit, notifications, limites, approbations et dashboard.

## Exclus du MVP

- création automatisée de comptes TikTok ;
- warm-up ou simulation d’activité ;
- achat de Coins, cartes ou moyens bancaires ;
- automatisation Promote par scraping, navigateur ou session ;
- garantie d’éligibilité Promote ;
- activation automatique de campagnes à dépense réelle ;
- transfert de fonds entre clients ;
- décision autonome d’optimisation budgétaire ;
- accès à un compte non autorisé.

## Statuts obligatoires

Chaque capacité, écran et ticket doit porter l’un des statuts suivants :

- **CONFIRMÉE PAR DOCUMENTATION** : contrat officiel exploitable ;
- **À TESTER** : documentation insuffisante ou dépendante du compte/marché ;
- **MANUELLE** : action réalisée dans TikTok par un utilisateur habilité ;
- **HORS MVP** : explicitement non livrée.

## Règles produit non négociables

1. `video.upload` signifie transfert vers la boîte de réception TikTok ; il ne signifie pas publication.
2. `video.publish` est le flux Direct Post, soumis à `creator_info/query`, consentement, scope et audit.
3. Promote n’est jamais présenté comme une fonctionnalité Marketing API sans preuve d’endpoint et de test.
4. Coins, Promote balance et Ads Manager balance sont des objets distincts.
5. Aucun mot de passe, cookie, secret client dans le navigateur, numéro de carte, CVV ou donnée bancaire n’est stocké.
6. Toute écriture publicitaire et toute dépense passent par une approbation humaine au MVP.
