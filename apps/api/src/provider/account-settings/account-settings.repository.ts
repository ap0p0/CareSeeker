import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProviderAccountSettingsPayload } from './account-settings.types';

@Injectable()
export class ProviderAccountSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const [user, provider] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.provider.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      }),
    ]);

    return { user, provider };
  }

  async updateByUserId(
    userId: string,
    payload: UpdateProviderAccountSettingsPayload,
  ) {
    const updates: Array<Promise<unknown>> = [];

    if (payload.email) {
      updates.push(
        this.prisma.user.update({
          where: { id: userId },
          data: { email: payload.email },
        }),
      );
      updates.push(
        this.prisma.provider.updateMany({
          where: { userId },
          data: { email: payload.email },
        }),
      );
    }

    if (payload.name || Object.prototype.hasOwnProperty.call(payload, 'phone')) {
      updates.push(
        this.prisma.provider.updateMany({
          where: { userId },
          data: {
            name: payload.name,
            phone: payload.phone,
          },
        }),
      );
    }

    await Promise.all(updates);
  }
}
