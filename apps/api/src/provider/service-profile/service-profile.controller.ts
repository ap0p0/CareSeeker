import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderServiceProfileService } from './service-profile.service';

/**
 * Onboarding step 2 (services & job interests). Provider-only: the guard
 * verifies the token and `requireProviderUserId` rejects non-providers, so a
 * provider can only ever read or write their own profile.
 */
@Controller('provider/service-profile')
@UseGuards(SupabaseJwtGuard)
export class ProviderServiceProfileController {
  constructor(
    private readonly serviceProfileService: ProviderServiceProfileService,
  ) {}

  @Get()
  get(@Req() req: AuthRequest) {
    return this.serviceProfileService.get(requireProviderUserId(req));
  }

  /** Creates or fully replaces step 2 (idempotent). */
  @Put()
  save(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.serviceProfileService.save(requireProviderUserId(req), body);
  }
}
