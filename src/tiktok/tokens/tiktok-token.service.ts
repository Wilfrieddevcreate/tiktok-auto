import { Injectable } from '@nestjs/common';
import { TikTokConnection } from '@prisma/client';
import { TokenCryptoService } from '../../common/security/token-crypto.service';

@Injectable()
export class TikTokTokenService {
  constructor(private readonly crypto: TokenCryptoService) {}
  accessToken(connection: TikTokConnection) { return this.crypto.decrypt(connection.encryptedAccessToken); }
  encrypt(value: string) { return this.crypto.encrypt(value); }
}
