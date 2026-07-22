import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProviderProfilePayload } from './profile.types';

@Injectable()
export class ProviderProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.provider.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  updateByUserId(userId: string, payload: UpdateProviderProfilePayload) {
    return this.prisma.provider.update({
      where: { userId },
      data: payload,
    });
  }
}
