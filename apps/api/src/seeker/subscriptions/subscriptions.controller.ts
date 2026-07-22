import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { SubscriptionsService } from './subscriptions.service';

@Controller('seeker/subscriptions')
@UseGuards(SupabaseJwtGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get()
  async getSubscription(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.subscriptionsService.getSubscription(seekerId);
  }

  @Get('status')
  async getSubscriptionStatus(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.subscriptionsService.getSubscriptionStatus(seekerId);
  }

  @Get('payments')
  async listPayments(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.subscriptionsService.listPayments(seekerId);
  }
}