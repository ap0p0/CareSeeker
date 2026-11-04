import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderOverviewService } from './overview.service';

/** Aggregated, read-only view of the signed-in provider's submitted data. */
@Controller('provider/overview')
@UseGuards(SupabaseJwtGuard)
export class ProviderOverviewController {
  constructor(private readonly overviewService: ProviderOverviewService) {}

  @Get()
  get(@Req() req: AuthRequest) {
    return this.overviewService.get(requireProviderUserId(req));
  }
}
