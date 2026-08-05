import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { NotificationsService } from './notifications.service';

@Controller('seeker/notifications')
@UseGuards(SupabaseJwtGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    const notification = await this.notificationsService.createNotification(
      seekerId,
      body,
    );

    return {
      success: true,
      message: 'Notification created successfully',
      data: notification,
    };
  }

  @Get()
  async listNotifications(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.notificationsService.listNotifications(seekerId);
  }

  @Patch(':notificationId/read')
  async markAsRead(
    @Req() req: AuthRequest,
    @Param('notificationId') notificationId: string,
  ) {
    const seekerId = requireSeekerUser(req);
    const notification = await this.notificationsService.markAsRead(
      seekerId,
      notificationId,
    );

    return {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  @Delete(':notificationId')
  async deleteNotification(
    @Req() req: AuthRequest,
    @Param('notificationId') notificationId: string,
  ) {
    const seekerId = requireSeekerUser(req);
    const notification = await this.notificationsService.deleteNotification(
      seekerId,
      notificationId,
    );

    return {
      success: true,
      message: 'Notification deleted successfully',
      data: notification,
    };
  }
}