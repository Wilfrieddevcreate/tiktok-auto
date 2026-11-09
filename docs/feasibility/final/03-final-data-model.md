# Modèle de données définitif du MVP

## Hiérarchie d’isolation

```text
Organization (tenant M2L)
  └── Client
       ├── TikTokConnection (Developer ou Business)
       ├── TikTokProfile
       │    └── ContentItem → PublishAttempt
       ├── AdvertiserAccount
       │    └── Campaign → AdGroup → Ad
       └── PromoteLink → PromoteOrder → PromoteMetricSnapshot
```

## Entités principales

- `Organization(id, name, status)`
- `Client(id, organization_id, legal_name, timezone, status)`
- `User(id, email, status, mfa_enabled)`
- `Membership(id, organization_id, user_id, role)`
- `ClientAccess(id, client_id, user_id, role)`
- `TikTokConnection(id, client_id, product, external_subject, encrypted_token, scopes, expires_at, status)`
- `OAuthState(id, product, state_hash, redirect_uri, expires_at, consumed_at)`
- `TikTokProfile(id, client_id, connection_id, open_id, username, status)`
- `AdvertiserAccount(id, client_id, connection_id, advertiser_id, business_center_id, currency, timezone, status)`
- `MediaAsset(id, client_id, object_key, checksum, type, rights_status, retention_until)`
- `ContentItem(id, client_id, media_asset_id, caption, approval_status, planned_at)`
- `PublishAttempt(id, content_id, profile_id, mode, scope, publish_id, status, failure_reason, source)`
- `Campaign(id, advertiser_account_id, external_id, origin, status, synced_at)`
- `AdGroup(id, campaign_id, external_id, budget, schedule_json, status)`
- `Ad(id, ad_group_id, external_id, creative_id, status)`
- `PromoteLink(id, client_id, profile_id, advertiser_account_id, status, eligibility_source, observed_at, region, platform)`
- `PromoteOrder(id, promote_link_id, external_order_id, external_campaign_id, origin_confidence, budget, currency, start_at, end_at, status, source)`
- `PromoteMetricSnapshot(id, promote_order_id, source, period_start, period_end, metrics_json, observed_at)`
- `ApprovalRequest(id, client_id, action, target_type, target_id, requested_by, approved_by, status, expires_at)`
- `ReportSnapshot(id, advertiser_account_id, level, dimensions_json, metrics_json, period, api_version, fetched_at)`
- `Job(id, tenant_id, queue, idempotency_key, status, attempts)`
- `AuditLog(id, organization_id, actor_id, action, target, before_json, after_json, correlation_id, created_at)`

## Contraintes d’intégrité

- toutes les tables métier portent `organization_id` ou le dérivent via une relation vérifiée ;
- `advertiser_id` est unique dans son contexte fournisseur, pas globalement sans tenant ;
- `open_id` et `external_subject` sont scoped par fournisseur/connexion ;
- un `PromoteLink` ne peut relier que des objets du même client ;
- une commande ne peut être exécutée que si son `ApprovalRequest` est valide ;
- un `PublishAttempt` porte explicitement `UPLOAD` ou `DIRECT_POST`, jamais seulement « published » ;
- aucun champ de carte, CVV, compte bancaire, mot de passe ou cookie.

## Valeurs de provenance

`source = CONTENT_POSTING_API | MARKETING_API | PROMOTE_UI | ADS_MANAGER_UI | MANUAL`.

`origin = PROMOTE | ADS_MANAGER | UNKNOWN` et `origin_confidence = DOCUMENTED | PILOT_VERIFIED | MANUAL | UNKNOWN`. Une campagne visible dans Ads Manager ne doit pas être classée Promote sans preuve.
