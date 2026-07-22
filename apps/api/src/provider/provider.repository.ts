import { Injectable } from '@nestjs/common';
import { ProviderProfileStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.provider.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  async createDefaultForUser(userId: string, email?: string) {
    let resolvedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!resolvedEmail) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      resolvedEmail = user?.email?.trim().toLowerCase() ?? '';
    }

    if (!resolvedEmail) {
      throw new Error('Unable to initialize provider profile without email');
    }

    return this.prisma.provider.create({
      data: {
        userId,
        name: 'Unknown Provider',
        email: resolvedEmail,
        status: ProviderProfileStatus.PENDING_VERIFICATION,
      },
    });
  }

  async findOrCreateByUser(userId: string, email: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    return this.createDefaultForUser(userId, email);
  }

  async ensureByUserId(userId: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    return this.createDefaultForUser(userId);
  }
}
