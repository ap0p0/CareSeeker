import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProviderProfilePayload } from './profile.types';

@Injectable()
export class ProviderProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.PROVIDER,
      },
    });
  }

  updateByUserId(userId: string, payload: UpdateProviderProfilePayload) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
      },
    });
  }
}
