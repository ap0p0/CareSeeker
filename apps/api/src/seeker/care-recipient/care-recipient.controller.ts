import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { CareRecipientService } from './care-recipient.service';

/**
 * Registration on behalf of someone else — step 2: the person receiving
 * care. `409 NOT_ON_BEHALF_ACCOUNT` for accounts registered for oneself.
 */
@Controller('seeker/care-recipient')
@UseGuards(SupabaseJwtGuard)
export class CareRecipientController {
  constructor(private readonly careRecipientService: CareRecipientService) {}

  /** `{ completed, careRecipient }` — `careRecipient` is null until saved. */
  @Get()
  async get(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.careRecipientService.get(seekerId);
  }

  /** Full replacement of step 2; safe to call again when editing. */
  @Put()
  async save(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    return this.careRecipientService.save(seekerId, body);
  }
}
