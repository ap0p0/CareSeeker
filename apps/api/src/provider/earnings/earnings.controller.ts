import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderEarningsService } from './earnings.service';

@Controller('provider/earnings')
@UseGuards(SupabaseJwtGuard)
export class ProviderEarningsController {
  constructor(private readonly earningsService: ProviderEarningsService) {}

  @Get()
  getSummary(@Req() req: AuthRequest) {
    return this.earningsService.getSummary(requireProviderUserId(req));
  }
}
