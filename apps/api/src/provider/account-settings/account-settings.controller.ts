import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderAccountSettingsService } from './account-settings.service';

@Controller('provider/account-settings')
@UseGuards(SupabaseJwtGuard)
export class ProviderAccountSettingsController {
  constructor(
    private readonly accountSettingsService: ProviderAccountSettingsService,
  ) {}

  @Get()
  get(@Req() req: AuthRequest) {
    return this.accountSettingsService.get(requireProviderUserId(req));
  }

  @Patch()
  update(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.accountSettingsService.update(requireProviderUserId(req), body);
  }
}
