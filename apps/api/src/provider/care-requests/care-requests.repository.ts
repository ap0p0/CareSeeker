import { Injectable } from '@nestjs/common';
import { CareRequestStatus } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderCareRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByProviderId(providerId: string) {
    return this.prisma.careRequest.findMany({
      where: {
        providerId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(providerId: string, requestId: string, status: CareRequestStatus) {
    return this.prisma.careRequest.updateMany({
      where: {
        id: requestId,
        providerId,
        deletedAt: null,
      },
      data: { status },
    });
  }
}
