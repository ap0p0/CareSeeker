import { Injectable } from '@nestjs/common';
import type { CreateNotificationDto } from './notifications.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: string, data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: data.title,
        body: data.body,
        type: data.type,
      },
    });
  }

  async listNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findNotification(userId: string, notificationId: string) {
    return this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        deletedAt: null,
      },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async softDelete(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { deletedAt: new Date() },
    });
  }
}