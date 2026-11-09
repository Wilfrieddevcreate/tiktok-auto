import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

@Injectable()
export class TokenCryptoService {
  private readonly key: Buffer;
  constructor() {
    const raw = process.env.TOKEN_ENCRYPTION_KEY;
    if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY is required');
    this.key = Buffer.from(raw, 'base64');
    if (this.key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
  }
  encrypt(value: string): string {
    const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.');
  }
  decrypt(payload: string): string {
    try {
      const [iv, tag, data] = payload.split('.'); const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64'));
      decipher.setAuthTag(Buffer.from(tag, 'base64'));
      return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
    } catch { throw new InternalServerErrorException('Token decryption failed'); }
  }
}
