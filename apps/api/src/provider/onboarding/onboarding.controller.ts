import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderOnboardingService } from './onboarding.service';

/** Where the signed-in provider is in the onboarding flow. */
@Controller('provider/onboarding')
@UseGuards(SupabaseJwtGuard)
export class ProviderOnboardingController {
  constructor(private readonly onboardingService: ProviderOnboardingService) {}

  @Get()
  status(@Req() req: AuthRequest) {
    return this.onboardingService.getStatus(requireProviderUserId(req));
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  complete(@Req() req: AuthRequest) {
    return this.onboardingService.complete(requireProviderUserId(req));
  }

  /** Provider confirmed the overview of their submitted data. */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Req() req: AuthRequest) {
    return this.onboardingService.confirm(requireProviderUserId(req));
  }
}
