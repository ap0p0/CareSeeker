import { CareRequestStatus, PaymentStatus } from '../../../generated/prisma/client.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(providerId: string, providerUserId: string) {
    const [completedRequests, pendingRequests, reviews, earnings] = await Promise.all([
      this.prisma.careRequest.count({
        where: {
          providerId,
          deletedAt: null,
          status: CareRequestStatus.COMPLETED,
        },
      }),
      this.prisma.careRequest.count({
        where: {
          providerId,
          deletedAt: null,
          status: CareRequestStatus.PENDING,
        },
      }),
      this.prisma.review.aggregate({
        where: {
          providerId: providerUserId,
          deletedAt: null,
        },
        _avg: { rating: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          userId: providerUserId,
          status: PaymentStatus.PAID,
        },
        _sum: { amountCents: true },
      }),
    ]);

    return {
      completedRequests,
      pendingRequests,
      averageRating: reviews._avg.rating,
      totalEarningsCents: earnings._sum.amountCents,
    };
  }
}
