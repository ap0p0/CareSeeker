import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { RegistrantService } from './registrant.service';

/**
 * The registrant (account holder) of a seeker account opened on behalf of
 * someone else. The account itself is created by
 * `POST /seeker/register/on-behalf`; these endpoints read / correct the
 * registrant's details afterwards. `404 REGISTRANT_NOT_FOUND` for accounts
 * registered for oneself.
 */
@Controller('seeker/registrant')
@UseGuards(SupabaseJwtGuard)
export class RegistrantController {
  constructor(private readonly registrantService: RegistrantService) {}

  @Get()
  async get(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.registrantService.get(seekerId);
  }

  /**
   * Full replacement of `name`, `surname`, `phone`, `relationship` and
   * `relationshipOther` (same rules as registration). Email / password are
   * account settings.
   */
  @Put()
  async update(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    const registrant = await this.registrantService.update(seekerId, body);

    return {
      success: true,
      message: 'Your details were saved',
      data: registrant,
    };
  }
}
