import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderEarningsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getSummary(providerUserId: string) {
    return Promise.all([
      this.prisma.payment.aggregate({
        where: { userId: providerUserId, status: PaymentStatus.PAID },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { userId: providerUserId, status: PaymentStatus.PENDING },
        _sum: { amountCents: true },
      }),
    ]);
  }
}
