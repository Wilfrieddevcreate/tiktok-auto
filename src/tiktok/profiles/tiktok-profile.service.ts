import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TikTokApiClient } from '../tiktok-api.client';
import { TikTokTokenService } from '../tokens/tiktok-token.service';

@Injectable()
export class TikTokProfileService {
  constructor(private readonly api: TikTokApiClient, private readonly prisma: PrismaService, private readonly tokens: TikTokTokenService) {}
  async getProfile(connectionId: string) {
    const connection = await this.prisma.tikTokConnection.findUniqueOrThrow({ where: { id: connectionId } });
    return this.api.post('/v2/user/info/', this.tokens.accessToken(connection), { fields: 'open_id,display_name,avatar_url' });
  }
}
