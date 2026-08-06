import { Injectable } from '@nestjs/common';
import {
  ProviderVerificationStatus,
  UserRole,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SavedProvidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findApprovedProvider(providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: providerId,
        role: UserRole.PROVIDER,
        providerVerificationStatus: ProviderVerificationStatus.APPROVED,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        providerVerificationStatus: true,
      },
    });
  }

  async saveProvider(seekerId: string, providerId: string) {
    return this.prisma.savedProvider.create({
      data: {
        seekerId,
        providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            surname: true,
            providerVerificationStatus: true,
          },
        },
      },
    });
  }

  async removeSavedProvider(seekerId: string, providerId: string) {
    return this.prisma.savedProvider.deleteMany({
      where: {
        seekerId,
        providerId,
      },
    });
  }

  async listSavedProviders(seekerId: string) {
    return this.prisma.savedProvider.findMany({
      where: { seekerId },
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            surname: true,
            providerVerificationStatus: true,
          },
        },
      },
    });
  }
}
