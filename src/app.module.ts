import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { SecurityModule } from './common/security/security.module';
import { TikTokModule } from './tiktok/tiktok.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SecurityModule, AuthModule, TikTokModule] })
export class AppModule {}
