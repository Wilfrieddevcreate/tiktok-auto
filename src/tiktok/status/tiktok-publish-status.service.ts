import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TikTokApiClient } from '../tiktok-api.client';
import { TikTokTokenService } from '../tokens/tiktok-token.service';

@Injectable()
export class TikTokPublishStatusService {
  constructor(private readonly prisma: PrismaService, private readonly tokens: TikTokTokenService, private readonly api: TikTokApiClient) {}
  async fetch(uploadId: string) {
    const upload = await this.prisma.tikTokUpload.findUniqueOrThrow({ where: { id: uploadId }, include: { connection: true } });
    const response = await this.api.post<{ data: { status: string; fail_reason?: string } }>('/v2/post/publish/status/fetch/', this.tokens.accessToken(upload.connection), { publish_id: upload.publishId });
    return { uploadId, publishId: upload.publishId, ...response.data };
  }
}
