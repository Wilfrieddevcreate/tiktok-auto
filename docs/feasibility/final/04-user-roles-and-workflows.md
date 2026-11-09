# Rôles, parcours utilisateurs et règles métier

## Rôles

| Rôle | Portée | Permissions principales |
|---|---|---|
| Administrateur M2L | organisation/plateforme | gérer tenants, connexions, rôles, politiques, kill switch ; jamais paiement client par défaut |
| Administrateur client | client | gérer accès, contenus, comptes autorisés, approbations métier |
| Opérateur VA | client assigné | exécuter tâches manuelles, préparer contenu, saisir preuves ; aucun paiement sans rôle séparé |
| Approbateur financier | client/compte | approuver budgets, paiements externes et activation ; accès minimum aux données |
| Lecteur | client | consulter dashboard, rapports et audit autorisé ; aucune écriture |

Le rôle n’accorde jamais un accès automatique à tous les comptes. La portée client et `advertiser_id` est obligatoire.

## Parcours connexion

1. L’administrateur client demande une connexion Developer ou Business.
2. M2L crée un `OAuthState` à usage unique.
3. L’utilisateur autorise dans TikTok.
4. NestJS échange le code côté serveur et chiffre le token.
5. M2L découvre les profils/annonceurs accessibles et exige une sélection explicite.
6. L’audit journalise scopes, utilisateur, compte et date.

## Parcours vidéo

### `video.upload` — brouillon/inbox

1. L’opérateur prépare le média et demande une approbation.
2. M2L appelle `/v2/post/publish/inbox/video/init/` avec `video.upload`.
3. M2L transfère le fichier ou fournit une URL de domaine vérifié.
4. TikTok envoie une notification inbox ; l’utilisateur termine l’édition et la publication dans TikTok.
5. M2L suit `publish_id` par status fetch/webhook.

### `video.publish` — Direct Post

1. L’application doit avoir le scope approuvé et l’utilisateur doit l’avoir accordé.
2. M2L appelle `/v2/post/publish/creator_info/query/` avant de rendre l’écran d’export.
3. L’utilisateur voit les options TikTok, consent et valide.
4. M2L appelle `/v2/post/publish/video/init/` puis suit le statut.
5. Un client non audité est limité à la visibilité privée ; le post ID public n’est pas garanti avant modération.

## Parcours Promote

1. Le système crée une tâche `PromoteManualWorkflow`.
2. Le VA vérifie dans TikTok l’éligibilité affichée et joint une preuve.
3. L’approbateur financier valide budget et méthode dans le cadre autorisé.
4. Le paiement, la liaison Ads Manager et le lancement sont effectués dans TikTok/Ads Manager.
5. M2L enregistre le résultat et distingue données saisies, UI et API.

## Règles métier

- aucune opération Promote ne se déclenche depuis une API M2L non documentée ;
- aucun paiement ne passe par M2L ;
- une campagne Ads Manager active exige une approbation financière au MVP ;
- un VA ne peut approuver sa propre action ;
- un token révoqué bloque les jobs et impose une reconnexion ;
- un webhook dupliqué est idempotent ;
- les budgets sont contrôlés avant exécution et les dépassements déclenchent un arrêt ;
- les comptes et données ne sont jamais recherchés par nom seul ;
- un contenu commercial exige la validation des droits et de la disclosure applicable ;
- chaque statut externe non confirmé est affiché comme `UNKNOWN` ou `MANUAL`.
