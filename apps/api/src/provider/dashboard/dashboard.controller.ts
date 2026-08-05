import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderDashboardService } from './dashboard.service';

@Controller('provider/dashboard')
@UseGuards(SupabaseJwtGuard)
export class ProviderDashboardController {
  constructor(private readonly dashboardService: ProviderDashboardService) {}

  @Get()
  getSummary(@Req() req: AuthRequest) {
    return this.dashboardService.getSummary(requireProviderUserId(req));
  }
}
