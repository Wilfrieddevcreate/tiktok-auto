import { Controller, Get, Param } from '@nestjs/common';
import { TikTokPublishStatusService } from './tiktok-publish-status.service';

@Controller('tiktok/status')
export class TikTokPublishStatusController {
  constructor(private readonly status: TikTokPublishStatusService) {}
  @Get(':uploadId') fetch(@Param('uploadId') uploadId: string) { return this.status.fetch(uploadId); }
}
