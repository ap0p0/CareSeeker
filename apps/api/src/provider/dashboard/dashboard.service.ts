import { Injectable } from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import { ProviderDashboardRepository } from './dashboard.repository';

@Injectable()
export class ProviderDashboardService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly dashboardRepository: ProviderDashboardRepository,
  ) {}

  async getSummary(userId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const metrics = await this.dashboardRepository.getMetrics(
      provider.id,
      provider.userId,
    );

    return {
      totalEarnings: Number(metrics.totalEarningsCents ?? 0) / 100,
      totalCompletedRequests: metrics.completedRequests,
      pendingRequestsCount: metrics.pendingRequests,
      averageRating: Number(metrics.averageRating ?? 0),
    };
  }
}
