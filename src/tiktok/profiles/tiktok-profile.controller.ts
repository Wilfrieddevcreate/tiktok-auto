import { Controller, Get, Param } from '@nestjs/common';
import { TikTokProfileService } from './tiktok-profile.service';

@Controller('tiktok/profiles')
export class TikTokProfileController {
  constructor(private readonly profiles: TikTokProfileService) {}
  @Get(':connectionId') get(@Param('connectionId') connectionId: string) { return this.profiles.getProfile(connectionId); }
}
