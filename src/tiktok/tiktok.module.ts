import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TikTokApiClient } from './tiktok-api.client';
import { TikTokOAuthController } from './oauth/tiktok-oauth.controller';
import { TikTokOAuthService } from './oauth/tiktok-oauth.service';
import { TikTokTokenService } from './tokens/tiktok-token.service';
import { TikTokProfileService } from './profiles/tiktok-profile.service';
import { TikTokProfileController } from './profiles/tiktok-profile.controller';
import { TikTokUploadController } from './uploads/tiktok-upload.controller';
import { TikTokUploadService } from './uploads/tiktok-upload.service';
import { TikTokPublishStatusController } from './status/tiktok-publish-status.controller';
import { TikTokPublishStatusService } from './status/tiktok-publish-status.service';

@Module({ imports: [HttpModule], controllers: [TikTokOAuthController, TikTokProfileController, TikTokUploadController, TikTokPublishStatusController], providers: [TikTokApiClient, TikTokOAuthService, TikTokTokenService, TikTokProfileService, TikTokUploadService, TikTokPublishStatusService] })
export class TikTokModule {}
