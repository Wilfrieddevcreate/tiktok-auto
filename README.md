# M2L TikTok Ads Operations — pilote Content Posting API

Socle backend NestJS limité à la Phase 0 Developer OAuth et à la préparation de `video.upload`. Aucune connexion réelle TikTok n’est considérée comme validée par les tests locaux.

## Périmètre

- OAuth TikTok Developer avec `state` hashé, expiration et consommation unique ;
- stockage chiffré des tokens côté serveur ;
- récupération du profil via `/v2/user/info/` ;
- initialisation `video.upload` via `/v2/post/publish/inbox/video/init/` ;
- transfert `FILE_UPLOAD` de test ;
- consultation `/v2/post/publish/status/fetch/` ;
- tests unitaires avec appels TikTok simulés.

`video.publish`, Promote, Marketing API, Redis, BullMQ, Socket.IO, Next.js et la gestion multi-client complète sont hors de cette étape.

## Installation

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npx prisma generate
npx prisma migrate dev --name init
npm test
npm run build
npm run start:dev
```

Générer une clé de chiffrement de développement :

```bash
openssl rand -base64 32
```

Ne jamais committer `.env` ni une vraie clé.

## Routes du pilote

- `GET /api/tiktok/oauth/authorize?organizationId=...&clientId=...&initiatedByUserId=...` : crée un état et retourne l’URL TikTok ;
- `GET /api/tiktok/oauth/callback?code=...&state=...` : échange le code côté serveur ; ne retourne pas de token ;
- `GET /api/tiktok/profiles/:connectionId` : récupère les informations du profil côté serveur ;
- `POST /api/tiktok/uploads/init` : initialise `FILE_UPLOAD` ou `PULL_FROM_URL` ;
- `POST /api/tiktok/uploads/:uploadId/transfer` : transfert de démonstration base64 `FILE_UPLOAD` ;
- `GET /api/tiktok/status/:uploadId` : interroge le statut par `publish_id`.

Les routes ne constituent pas encore une API de production : authentification M2L, RBAC complet, rate limiting et isolation multi-tenant complète seront ajoutés dans les phases suivantes.

## Variables d’environnement

Voir `.env.example`. Les valeurs TikTok Developer doivent être fournies par le propriétaire de l’application. `TIKTOK_SCOPES` doit correspondre aux scopes réellement approuvés ; le service vérifie `video.upload` avant l’initialisation.

## Premier test OAuth réel

1. Créer/configurer une application sur [TikTok for Developers](https://developers.tiktok.com/).
2. Activer Login Kit et Content Posting API.
3. Demander les scopes réellement nécessaires et enregistrer exactement `TIKTOK_REDIRECT_URI`.
4. Renseigner les variables sans les committer.
5. Démarrer PostgreSQL, migration et serveur.
6. Ouvrir la route `authorize` dans un navigateur.
7. Autoriser le profil de test et vérifier le callback.
8. Vérifier en base que les tokens sont chiffrés et que seules les scopes accordées sont enregistrées.
9. Tester l’initialisation d’un upload valide ; l’utilisateur doit terminer la publication dans TikTok.

Références : [Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post), [Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video), [Status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status), [OAuth tokens](https://developers.tiktok.com/docs/en/oauth-user-access-token-management).
