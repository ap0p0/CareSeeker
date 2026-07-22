import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '../../../generated/prisma/client.js';
import {
  ensureObject,
  isUuid,
  lowerCaseEnum,
  readOptionalEnum,
  readRequiredString,
} from '../seeker.validation';
import type { CreateNotificationDto } from './notifications.dto';
import { NotificationsRepository } from './notifications.repository';

const NOTIFICATION_TYPES = [
  NotificationType.GENERAL,
  NotificationType.JOB,
  NotificationType.MESSAGE,
  NotificationType.PAYMENT,
  NotificationType.REVIEW,
] as const;

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(userId: string, body: unknown) {
    const payload = this.validateCreatePayload(body);
    const notification = await this.notificationsRepository.createNotification(
      userId,
      payload,
    );

    return this.serializeNotification(notification);
  }

  async listNotifications(userId: string) {
    const notifications =
      await this.notificationsRepository.listNotifications(userId);

    return notifications.map((notification) =>
      this.serializeNotification(notification),
    );
  }

  async markAsRead(userId: string, notificationId: string) {
    this.ensureUuid(notificationId, 'notificationId');
    const notification = await this.notificationsRepository.findNotification(
      userId,
      notificationId,
    );

    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
      });
    }

    return this.serializeNotification(
      await this.notificationsRepository.markAsRead(notificationId),
    );
  }

  async deleteNotification(userId: string, notificationId: string) {
    this.ensureUuid(notificationId, 'notificationId');
    const notification = await this.notificationsRepository.findNotification(
      userId,
      notificationId,
    );

    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
      });
    }

    return this.serializeNotification(
      await this.notificationsRepository.softDelete(notificationId),
    );
  }

  private validateCreatePayload(payload: unknown): CreateNotificationDto {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const errors: string[] = [];
    const title = readRequiredString(body, 'title', errors);
    const notificationBody = readRequiredString(body, 'body', errors);
    const type = readOptionalEnum(body, 'type', NOTIFICATION_TYPES, errors);

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid notification payload',
        errors,
      });
    }

    return {
      title,
      body: notificationBody,
      type,
    };
  }

  private ensureUuid(value: string, field: string) {
    if (!isUuid(value)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `${field} must be a valid UUID`,
      });
    }
  }

  private serializeNotification(notification: {
    id: string;
    title: string;
    body: string;
    type: NotificationType;
    readAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: lowerCaseEnum(notification.type),
      readAt: notification.readAt,
      deletedAt: notification.deletedAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}