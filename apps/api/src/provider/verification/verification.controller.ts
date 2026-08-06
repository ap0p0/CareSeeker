import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderVerificationService } from './verification.service';

@Controller('provider/verification')
@UseGuards(SupabaseJwtGuard)
export class ProviderVerificationController {
  constructor(
    private readonly verificationService: ProviderVerificationService,
  ) {}

  @Post()
  submit(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.verificationService.submit(requireProviderUserId(req), body);
  }

  @Get('status')
  status(@Req() req: AuthRequest) {
    return this.verificationService.status(requireProviderUserId(req));
  }
}
