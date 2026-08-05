import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderNotificationsService } from './notifications.service';

@Controller('provider/notifications')
@UseGuards(SupabaseJwtGuard)
export class ProviderNotificationsController {
  constructor(
    private readonly notificationsService: ProviderNotificationsService,
  ) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.notificationsService.list(requireProviderUserId(req));
  }

  @Patch(':notificationId/read')
  markAsRead(
    @Req() req: AuthRequest,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(
      requireProviderUserId(req),
      notificationId,
    );
  }
}
