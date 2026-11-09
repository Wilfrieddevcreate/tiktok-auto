# Tests d’acceptation du MVP

## Critères fonctionnels

| ID | Test | Résultat attendu | Statut |
|---|---|---|---|
| A01 | connecter un profil TikTok | token chiffré, scopes affichés, profil sélectionné | À TESTER |
| A02 | upload `video.upload` | inbox notification et `publish_id`, aucune fausse publication locale | À TESTER |
| A03 | Direct Post `video.publish` | creator info affiché, consentement, statut suivi | À TESTER |
| A04 | statut/webhook | événement dupliqué idempotent, erreur visible | À TESTER |
| A05 | connecter annonceur | `advertiser_id` explicitement associé au client | À TESTER |
| A06 | rapport Ads Manager | métriques, période et fuseau rapprochés | À TESTER |
| A07 | Promote manuel | tâche, preuve, approbation et résultat enregistrés | CONFIRMÉE PAR PROCESSUS |
| A08 | Promote dans rapport API | classé confirmé seulement si trouvé et rapproché | À TESTER |
| A09 | paiement | aucune donnée bancaire dans M2L | CONFIRMÉE PAR RÈGLE |

## Sécurité

- vérifier qu’un token n’est présent ni dans HTML, logs, traces, URL ni erreurs ;
- tester OAuth state replay, callback incorrect et code expiré ;
- tester SSRF sur `PULL_FROM_URL` et URLs signées expirées ;
- tester webhook sans signature/hash valide, replay et surcharge ;
- tester RBAC : VA sans paiement, lecteur sans écriture, client sans autre tenant ;
- vérifier chiffrement, rotation et purge des tokens ;
- vérifier suppression/révocation sans conserver de secret actif.

## Isolation multi-tenant

Créer deux clients, deux profils, deux annonceurs et deux utilisateurs. Vérifier : lecture, recherche, exports, jobs, notifications, métriques, fichiers et audit. Toute requête sans filtre tenant doit échouer en revue de code et en test d’intégration.

## Charge et résilience

- simuler 10, 50 puis 200 comptes avec synchronisations planifiées ;
- injecter 401, 403, 429, timeout et 5xx ;
- vérifier backoff, dead-letter queue et absence de doublon ;
- mesurer latence dashboard et saturation PostgreSQL/Redis ;
- vérifier limites par token et compte, pas seulement limite globale ;
- tester arrêt global avant une tâche financière ;
- restaurer PostgreSQL et reprendre les jobs sans double écriture.

## Sortie d’acceptation

Le MVP est accepté uniquement si tous les tests critiques A01–A06 et sécurité/isolation passent, si les limites TikTok sont observées, et si Promote reste explicitement manuel tant que son exposition API n’est pas prouvée. Une capture Ads Manager seule ne valide pas un endpoint Marketing API.
