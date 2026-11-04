import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderWorkPreferencesService } from './work-preferences.service';

/** Onboarding step 4 (availability & work preferences). Provider-only. */
@Controller('provider/work-preferences')
@UseGuards(SupabaseJwtGuard)
export class ProviderWorkPreferencesController {
  constructor(
    private readonly workPreferencesService: ProviderWorkPreferencesService,
  ) {}

  @Get()
  get(@Req() req: AuthRequest) {
    return this.workPreferencesService.get(requireProviderUserId(req));
  }

  /** Creates or fully replaces step 4 (idempotent). */
  @Put()
  save(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.workPreferencesService.save(requireProviderUserId(req), body);
  }
}
