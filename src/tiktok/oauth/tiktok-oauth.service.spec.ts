import { TikTokOAuthService } from './tiktok-oauth.service';
import { BadRequestException } from '@nestjs/common';

describe('TikTokOAuthService', () => {
  const prisma = { oAuthState: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() } } as any;
  const config = { get: jest.fn((key: string, fallback?: string) => fallback), getOrThrow: jest.fn((key: string) => ({ TIKTOK_CLIENT_KEY: 'key', TIKTOK_CLIENT_SECRET: 'secret', TIKTOK_REDIRECT_URI: 'http://localhost/callback' } as Record<string, string>)[key]) } as any;
  const tokens = { encrypt: jest.fn((value: string) => `encrypted:${value}`) } as any;

  beforeEach(() => jest.clearAllMocks());

  it('creates a cryptographic state record and authorization URL', async () => {
    prisma.oAuthState.create.mockResolvedValue({});
    const service = new TikTokOAuthService(config, prisma, tokens);
    const url = await service.authorizationUrl('org', 'client', 'user');
    expect(prisma.oAuthState.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId: 'org', clientId: 'client', initiatedByUserId: 'user', connectionProduct: 'DEVELOPER', stateHash: expect.any(String) }) }));
    expect(url).toContain('https://www.tiktok.com/v2/auth/authorize/');
    expect(url).toContain('state=');
  });

  it('rejects unknown, expired or consumed states before exchanging a code', async () => {
    prisma.oAuthState.findUnique.mockResolvedValue(null);
    const service = new TikTokOAuthService(config, prisma, tokens);
    await expect(service.callback('code', 'state')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.oAuthState.update).not.toHaveBeenCalled();
  });
});
