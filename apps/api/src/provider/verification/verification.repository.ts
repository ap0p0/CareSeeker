import { Injectable } from '@nestjs/common';
import {
  ProviderVerificationRecordStatus,
  ProviderVerificationStatus,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(providerId: string, documentType: string, documentUrl: string) {
    return this.prisma.providerVerification.create({
      data: {
        providerId,
        documentType,
        documentUrl,
        status: ProviderVerificationRecordStatus.PENDING,
      },
    });
  }

  latestByProviderId(providerId: string) {
    return this.prisma.providerVerification.findFirst({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateUserVerificationStatus(
    userId: string,
    status: ProviderVerificationStatus,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { providerVerificationStatus: status },
    });
  }
}
