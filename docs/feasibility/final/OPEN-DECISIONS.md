# M2L — décisions ouvertes v1.1

**Statut :** points à valider avant ou pendant la phase pilote.  
**Date de vérification documentaire :** 9 novembre 2026.

| ID | Décision | Risque si non résolue | Responsable attendu | Échéance |
|---|---|---|---|---|
| D01 | Le rôle Gestionnaire est-il distinct de l’administrateur client ? | RBAC ambigu | Client/M2L | Avant implémentation RBAC |
| D02 | Quels pays, devises, plateformes et fuseaux sont prioritaires ? | scopes, Promote et billing variables | Client | Phase 0 |
| D03 | Quels comptes TikTok et annonceurs peuvent servir de pilotes ? | intégrations impossibles à valider | Client | Phase 0 |
| D04 | Quels scopes Developer et permissions Business seront demandés ? | refus d’audit ou périmètre insuffisant | M2L + client | Phase 0 |
| D05 | Le token Business est-il renouvelable, long terme ou réautorisé dans le portail courant ? | jobs interrompus | M2L | Pilote OAuth Business |
| D06 | PostgreSQL RLS est-il activé dès le MVP ? | modèle d’isolation moins défensif | Architecture/Sécurité | Avant données réelles |
| D07 | Quelles clés étrangères composites sont supportées par le schéma retenu ? | incohérences cross-tenant | Backend/DB | Phase 1 |
| D08 | Quel mécanisme d’authenticité webhook TikTok est officiellement disponible pour chaque produit ? | falsification ou rejet d’événements | Sécurité | Pilote webhook |
| D09 | Les Promote orders apparaissent-ils dans `/report/integrated/get/` ? | reporting Promote manuel obligatoire | Intégration | Pilote |
| D10 | Existe-t-il un champ de provenance Promote fiable ? | classification erronée des campagnes | Intégration | Pilote |
| D11 | Quel est le nombre de comptes prévu pour le premier pilote ? | dimensionnement prématuré | Client/M2L | Phase 0 |
| D12 | Quels montants et paramètres exigent double approbation ? | double dépense ou fraude interne | Client/Finance | Avant workflow |
| D13 | Quelle durée de rétention pour médias, preuves, rapports et audit ? | coût ou non-conformité | Client/Juridique | Avant production |
| D14 | Quels KPI et quelle source font foi en cas de divergence ? | dashboard contestable | Client | Phase 3/4 |

## Règles en attente

Tant qu’une décision n’est pas prise, la règle la plus restrictive s’applique : Promote reste manuel, aucune écriture financière n’est automatisée, aucune donnée n’est partagée entre tenants et toute capacité TikTok non prouvée reste `À TESTER` ou `HORS MVP`.

## Bloquants absolus

D03, D04, D05, D06, D08 et D09 sont bloquants pour une validation complète du MVP. D01, D12 et D13 sont bloquants pour une mise en production multi-client.
