import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { TikTokOAuthService } from './tiktok-oauth.service';

@Controller('tiktok/oauth')
export class TikTokOAuthController {
  constructor(private readonly oauth: TikTokOAuthService) {}
  @Get('authorize') authorize(@Query('organizationId') organizationId?: string, @Query('clientId') clientId?: string, @Query('initiatedByUserId') initiatedByUserId?: string) { return this.oauth.authorizationUrl(organizationId, clientId, initiatedByUserId).then(authorizationUrl => ({ authorizationUrl })); }
  @Get('callback') callback(@Query('code') code?: string, @Query('state') state?: string) { if (!code || !state) throw new BadRequestException('code and state are required'); return this.oauth.callback(code, state); }
}
