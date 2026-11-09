import { TikTokUploadService } from './tiktok-upload.service';
import { BadRequestException } from '@nestjs/common';

describe('TikTokUploadService', () => {
  it('rejects initialization when video.upload was not granted', async () => {
    const prisma = { tikTokConnection: { findUniqueOrThrow: jest.fn().mockResolvedValue({ scopes: 'user.info.basic' }) } } as any;
    const service = new TikTokUploadService(prisma, {} as any, {} as any);
    await expect(service.initialize('connection', 'FILE_UPLOAD', 100, 100, 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('keeps an initialized upload distinct from creator publication', async () => {
    const prisma = {
      tikTokConnection: { findUniqueOrThrow: jest.fn().mockResolvedValue({ scopes: 'user.info.basic,video.upload' }) },
      tikTokUpload: { create: jest.fn().mockResolvedValue({ id: 'upload-1', publishId: 'pub-1', uploadUrl: 'https://upload', status: 'INITIALIZED' }) },
    } as any;
    const api = { post: jest.fn().mockResolvedValue({ data: { publish_id: 'pub-1', upload_url: 'https://upload' } }) } as any;
    const service = new TikTokUploadService(prisma, { accessToken: jest.fn().mockReturnValue('token') } as any, api);
    const result = await service.initialize('connection', 'FILE_UPLOAD', 100, 100, 1);
    expect(result).toMatchObject({ publishId: 'pub-1', requiresCreatorAction: true, status: 'INITIALIZED' });
    expect(api.post).toHaveBeenCalledWith('/v2/post/publish/inbox/video/init/', 'token', expect.any(Object));
  });
});
