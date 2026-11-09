import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TikTokApiClient } from '../tiktok-api.client';
import { TikTokTokenService } from '../tokens/tiktok-token.service';
import axios from 'axios';

@Injectable()
export class TikTokUploadService {
  constructor(private readonly prisma: PrismaService, private readonly tokens: TikTokTokenService, private readonly api: TikTokApiClient) {}
  async initialize(connectionId: string, source: 'FILE_UPLOAD' | 'PULL_FROM_URL', videoSize?: number, chunkSize?: number, totalChunkCount?: number, videoUrl?: string) {
    const connection = await this.prisma.tikTokConnection.findUniqueOrThrow({ where: { id: connectionId } });
    if (!connection.scopes.split(',').includes('video.upload')) throw new BadRequestException('video.upload scope is not granted');
    const sourceInfo = source === 'FILE_UPLOAD' ? { source, video_size: videoSize, chunk_size: chunkSize, total_chunk_count: totalChunkCount } : { source, video_url: videoUrl };
    const response = await this.api.post<{ data: { publish_id: string; upload_url?: string } }>('/v2/post/publish/inbox/video/init/', this.tokens.accessToken(connection), { source_info: sourceInfo });
    const upload = await this.prisma.tikTokUpload.create({ data: { connectionId, publishId: response.data.publish_id, uploadUrl: response.data.upload_url, status: 'INITIALIZED', source, fileSize: videoSize } });
    return { id: upload.id, publishId: upload.publishId, uploadUrl: upload.uploadUrl, status: upload.status, requiresCreatorAction: true };
  }

  async transfer(uploadId: string, content: Buffer, contentType: string) {
    const upload = await this.prisma.tikTokUpload.findUniqueOrThrow({ where: { id: uploadId } });
    if (!upload.uploadUrl) throw new BadRequestException('This upload has no FILE_UPLOAD URL');
    await this.prisma.tikTokUpload.update({ where: { id: uploadId }, data: { status: 'UPLOADING' } });
    try {
      await axios.put(upload.uploadUrl, content, { headers: { 'Content-Type': contentType, 'Content-Length': content.length, 'Content-Range': `bytes 0-${content.length - 1}/${content.length}` }, timeout: 60_000 });
      await this.prisma.tikTokUpload.update({ where: { id: uploadId }, data: { status: 'UPLOADED', sourceObservedAt: new Date() } });
      return { uploadId, status: 'UPLOADED', requiresCreatorAction: true };
    } catch (error) {
      await this.prisma.tikTokUpload.update({ where: { id: uploadId }, data: { status: 'FAILED', failureReason: error instanceof Error ? error.message : 'transfer_failed' } });
      throw error;
    }
  }
}
