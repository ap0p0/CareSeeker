import { Injectable } from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import { ProviderEarningsRepository } from './earnings.repository';

@Injectable()
export class ProviderEarningsService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly earningsRepository: ProviderEarningsRepository,
  ) {}

  async getSummary(userId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const [paidStats, pendingStats] = await this.earningsRepository.getSummary(
      provider.userId,
    );

    return {
      totalPaidAmount: Number(paidStats._sum.amountCents ?? 0) / 100,
      paidPaymentsCount: paidStats._count,
      pendingAmount: Number(pendingStats._sum.amountCents ?? 0) / 100,
    };
  }
}
