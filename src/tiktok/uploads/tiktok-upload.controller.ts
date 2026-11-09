import { Body, Controller, Param, Post } from '@nestjs/common';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TikTokUploadService } from './tiktok-upload.service';

class InitializeUploadDto {
  @IsString() connectionId!: string;
  @IsIn(['FILE_UPLOAD', 'PULL_FROM_URL']) source!: 'FILE_UPLOAD' | 'PULL_FROM_URL';
  @IsOptional() @IsInt() @Min(1) videoSize?: number;
  @IsOptional() @IsInt() @Min(1) chunkSize?: number;
  @IsOptional() @IsInt() @Min(1) totalChunkCount?: number;
  @IsOptional() @IsString() videoUrl?: string;
}
class TransferUploadDto {
  @IsString() base64Data!: string;
  @IsString() contentType!: string;
}
@Controller('tiktok/uploads')
export class TikTokUploadController {
  constructor(private readonly uploads: TikTokUploadService) {}
  @Post('init') init(@Body() dto: InitializeUploadDto) { return this.uploads.initialize(dto.connectionId, dto.source, dto.videoSize, dto.chunkSize, dto.totalChunkCount, dto.videoUrl); }
  @Post(':uploadId/transfer') transfer(@Param('uploadId') uploadId: string, @Body() dto: TransferUploadDto) { return this.uploads.transfer(uploadId, Buffer.from(dto.base64Data, 'base64'), dto.contentType); }
}
