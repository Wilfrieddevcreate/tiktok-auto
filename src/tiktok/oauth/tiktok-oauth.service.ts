import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TikTokTokenService } from '../tokens/tiktok-token.service';

@Injectable()
export class TikTokOAuthService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService, private readonly tokens: TikTokTokenService) {}
  async authorizationUrl(organizationId?: string, clientId?: string, initiatedByUserId?: string) {
    const state = randomBytes(32).toString('hex'); const ttl = Number(this.config.get('OAUTH_STATE_TTL_SECONDS', '600'));
    await this.prisma.oAuthState.create({ data: { organizationId, clientId, initiatedByUserId, connectionProduct: 'DEVELOPER', stateHash: createHash('sha256').update(state).digest('hex'), redirectUri: this.config.getOrThrow('TIKTOK_REDIRECT_URI'), expiresAt: new Date(Date.now() + ttl * 1000) } });
    const params = new URLSearchParams({ client_key: this.config.getOrThrow('TIKTOK_CLIENT_KEY'), response_type: 'code', scope: this.config.get('TIKTOK_SCOPES', 'user.info.basic,video.upload'), redirect_uri: this.config.getOrThrow('TIKTOK_REDIRECT_URI'), state });
    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }
  async callback(code: string, state: string) {
    const stateHash = createHash('sha256').update(state).digest('hex'); const record = await this.prisma.oAuthState.findUnique({ where: { stateHash } });
    if (!record || record.consumedAt || record.expiresAt <= new Date()) throw new BadRequestException('Invalid, expired or consumed OAuth state');
    await this.prisma.oAuthState.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', new URLSearchParams({ client_key: this.config.getOrThrow('TIKTOK_CLIENT_KEY'), client_secret: this.config.getOrThrow('TIKTOK_CLIENT_SECRET'), code, grant_type: 'authorization_code', redirect_uri: record.redirectUri }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const data = response.data as { access_token: string; refresh_token: string; open_id: string; scope: string; expires_in: number; refresh_expires_in?: number };
    await this.prisma.tikTokConnection.create({ data: { organizationId: record.organizationId, clientId: record.clientId, product: 'DEVELOPER', externalSubject: data.open_id, encryptedAccessToken: this.tokens.encrypt(data.access_token), encryptedRefreshToken: this.tokens.encrypt(data.refresh_token), scopes: data.scope, accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000), refreshTokenExpiresAt: data.refresh_expires_in ? new Date(Date.now() + data.refresh_expires_in * 1000) : null } });
    return { connected: true, openId: data.open_id, scopes: data.scope };
  }
}
