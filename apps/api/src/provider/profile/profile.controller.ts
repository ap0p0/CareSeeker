import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderProfileService } from './profile.service';

@Controller('provider/profile')
@UseGuards(SupabaseJwtGuard)
export class ProviderProfileController {
  constructor(private readonly profileService: ProviderProfileService) {}

  @Get()
  getProfile(@Req() req: AuthRequest) {
    const userId = requireProviderUserId(req);
    return this.profileService.getProfile(userId);
  }

  @Patch()
  updateProfile(@Req() req: AuthRequest, @Body() body: unknown) {
    const userId = requireProviderUserId(req);
    return this.profileService.updateProfile(userId, body);
  }
}
