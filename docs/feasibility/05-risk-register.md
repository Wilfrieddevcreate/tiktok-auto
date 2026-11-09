    # Registre des risques

    **Date : 9 novembre 2026**

    | ID | Risque | Probabilité | Impact | Traitement |
    |---|---|---:|---:|---|
    | R1 | Absence d’API publique Promote/Coins | Élevée | Critique | Parcours VA assisté ; ne pas vendre l’automatisation |
    | R2 | Création massive de comptes perçue comme abusive | Élevée | Critique | Onboarding manuel, preuve de propriété, aucun contournement |
    | R3 | Warm-up automatisé assimilé à du spam | Élevée | Critique | Remplacer par checklist de conformité et intervention humaine |
    | R4 | Audit/refus de l’application TikTok | Moyenne | Critique | MVP étroit, UX conforme, comptes de démo, plan sans publication publique |
    | R5 | Post privé avec client non audité | Élevée | Élevé | Afficher le statut d’audit et obtenir l’approbation avant engagement |
    | R6 | Token révoqué/permission manquante | Moyenne | Élevé | Détection 401/403, reconnexion, secrets chiffrés |
    | R7 | Double création ou double dépense après retry | Moyenne | Critique | Idempotence, commandes approuvées, plafond, kill switch |
    | R8 | Fuite de données entre clients | Faible mais critique | Critique | Tenant isolation, tests sécurité, RBAC par compte |
    | R9 | Paiement ou données bancaires exposés | Moyenne | Critique | Paiement hors M2L, aucune donnée carte/CVV/bancaire |
    | R10 | Confusion Coins / solde Ads Manager | Élevée | Élevé | Modèles, devises et sources séparés |
    | R11 | Limites, 429 et dépréciations API | Élevée | Moyen/Élevé | Queues, backoff, quotas, adaptateurs versionnés |
    | R12 | Divergence KPI Promote/Ads Manager | Élevée | Élevé | Source, période, fuseau, attribution et rapprochement visibles |
    | R13 | Contenu ou musique non autorisés | Moyenne | Élevé | Validation humaine et contrôle de droits |
    | R14 | Médias hébergés sur URL non vérifiée | Moyenne | Moyen | Domaine vérifié, URL signées, contrôle SSRF |
    | R15 | Dépendance à un compte VA ou appareil | Moyenne | Élevé | Procédure de relève, deux personnes habilitées, audit trail |
    | R16 | Montée de charge à plusieurs centaines de comptes | Moyenne | Élevé | Jobs partitionnés, limites par compte, observabilité, tests de charge |
    | R17 | Modification région/devise/fuseau impossible | Moyenne | Moyen | Valider la configuration en amont ; pas de modification automatique |
    | R18 | Utilisation de scraping ou browser automation | Moyenne | Critique | Interdiction explicite ; API officielle ou opérateur humain |

    ## Go/no-go des risques critiques

    R1, R2, R3 et R18 empêchent de promettre le scénario initial entièrement automatisé. R4, R5 et R6 conditionnent la mise en production des intégrations officielles. R7, R8 et R9 doivent être traités avant toute écriture ou opération financière.

    ## Mesures contractuelles

    Le devis doit exclure la création de comptes TikTok, le warm-up artificiel, les achats de Coins, les garanties d’éligibilité Promote et toute promesse de contournement. Il doit prévoir les délais de revue TikTok comme dépendances externes, sans SLA garanti.
