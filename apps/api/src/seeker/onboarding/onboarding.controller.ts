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
import { requireSeekerUser } from '../require-seeker';
import { SeekerOnboardingService } from './onboarding.service';

/** Where the signed-in seeker is in the registration flow. */
@Controller('seeker/onboarding')
@UseGuards(SupabaseJwtGuard)
export class SeekerOnboardingController {
  constructor(private readonly onboardingService: SeekerOnboardingService) {}

  /** Status plus everything saved so far (review page + route guard). */
  @Get()
  status(@Req() req: AuthRequest) {
    return this.onboardingService.getStatus(requireSeekerUser(req));
  }

  /** All steps saved → registration finished (opens the review page). */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  complete(@Req() req: AuthRequest) {
    return this.onboardingService.complete(requireSeekerUser(req));
  }

  /** Seeker confirmed the review of their submitted data. */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Req() req: AuthRequest) {
    return this.onboardingService.confirm(requireSeekerUser(req));
  }
}
