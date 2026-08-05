import { Injectable, NotFoundException } from '@nestjs/common';
import { ProviderNotificationsRepository } from './notifications.repository';

@Injectable()
export class ProviderNotificationsService {
  constructor(
    private readonly notificationsRepository: ProviderNotificationsRepository,
  ) {}

  list(userId: string) {
    return this.notificationsRepository.listByUserId(userId).then((rows) =>
      rows.map((row) => ({
        id: row.id,
        type: row.type,
        message: row.body,
        title: row.title,
        isRead: row.readAt !== null,
        createdAt: row.createdAt,
      })),
    );
  }

  async markAsRead(userId: string, notificationId: string) {
    const result = await this.notificationsRepository.markAsRead(
      userId,
      notificationId,
    );

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return { success: true };
  }
}
