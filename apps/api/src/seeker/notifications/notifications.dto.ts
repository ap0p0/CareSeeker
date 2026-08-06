import type { NotificationType } from '../../../generated/prisma/client.js';

export type CreateNotificationDto = {
  title: string;
  body: string;
  type?: NotificationType;
};
