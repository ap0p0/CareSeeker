import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderNotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        deletedAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}
