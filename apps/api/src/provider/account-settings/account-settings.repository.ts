import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProviderAccountSettingsPayload } from './account-settings.types';

@Injectable()
export class ProviderAccountSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return { user };
  }

  async updateByUserId(
    userId: string,
    payload: UpdateProviderAccountSettingsPayload,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: payload.email,
        name: payload.name,
      },
    });
  }
}
