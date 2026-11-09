import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { CarePreferencesService } from './care-preferences.service';

/**
 * Registration on behalf of someone else — step 3: care needs & assistance
 * preferences. `409 NOT_ON_BEHALF_ACCOUNT` for accounts registered for
 * oneself.
 */
@Controller('seeker/care-preferences')
@UseGuards(SupabaseJwtGuard)
export class CarePreferencesController {
  constructor(
    private readonly carePreferencesService: CarePreferencesService,
  ) {}

  /** `{ completed, preferences }` — `preferences` is null until saved. */
  @Get()
  async get(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.carePreferencesService.get(seekerId);
  }

  /** Full replacement of step 3 (schedule included); safe to re-save. */
  @Put()
  async save(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    return this.carePreferencesService.save(seekerId, body);
  }
}
