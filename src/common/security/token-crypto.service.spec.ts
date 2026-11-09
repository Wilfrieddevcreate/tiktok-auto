import { TokenCryptoService } from './token-crypto.service';

describe('TokenCryptoService', () => {
  beforeEach(() => { process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64'); });
  it('encrypts and decrypts without exposing plaintext in the payload', () => {
    const service = new TokenCryptoService(); const encrypted = service.encrypt('access-token');
    expect(encrypted).not.toContain('access-token'); expect(service.decrypt(encrypted)).toBe('access-token');
  });
});
