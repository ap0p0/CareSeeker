import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
    });
  }

  async listPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}
