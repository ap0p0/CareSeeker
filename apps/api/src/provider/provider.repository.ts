import { Injectable } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';

type ProviderIdentity = {
  id: string;
  userId: string;
  email: string;
};

@Injectable()
export class ProviderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ProviderIdentity | null> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, role: UserRole.PROVIDER },
    });

    if (!user) return null;

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
    };
  }

  async createDefaultForUser(userId: string, email?: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Unable to initialize provider profile without user');
    }

    if (user.role !== UserRole.PROVIDER) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.PROVIDER },
      });
    }

    return {
      id: user.id,
      userId: user.id,
      email: email?.trim().toLowerCase() || user.email,
    };
  }

  async findOrCreateByUser(userId: string, email: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    return this.createDefaultForUser(userId, email);
  }

  async ensureByUserId(userId: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Provider user not found');
    }

    if (user.role !== UserRole.PROVIDER) {
      throw new Error('User is not a provider');
    }

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
    };
  }
}
