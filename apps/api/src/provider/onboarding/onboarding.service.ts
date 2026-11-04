import { ConflictException, Injectable } from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import { ProviderOnboardingRepository } from './onboarding.repository';
import type { ProviderOnboardingStatus } from './onboarding.types';

@Injectable()
export class ProviderOnboardingService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly onboardingRepository: ProviderOnboardingRepository,
  ) {}

  async getStatus(userId: string): Promise<ProviderOnboardingStatus> {
    await this.providerRepository.ensureByUserId(userId);
    return this.onboardingRepository.getProgress(userId);
  }

  /**
   * Marks the flow as finished. Steps 1, 2 and 4 must exist; documents
   * (step 3) are optional. Idempotent: completing twice keeps the first
   * timestamp.
   */
  async complete(userId: string): Promise<ProviderOnboardingStatus> {
    const status = await this.getStatus(userId);

    if (status.completedAt) return status;

    if (
      !status.personalInfo ||
      !status.serviceProfile ||
      !status.workPreferences
    ) {
      throw new ConflictException({
        code: 'ONBOARDING_INCOMPLETE',
        message:
          'Personal information, services & job interests and availability & work preferences must be saved before finishing onboarding.',
      });
    }

    const { onboardingCompletedAt } =
      await this.onboardingRepository.markCompleted(userId, new Date());

    return { ...status, completedAt: onboardingCompletedAt };
  }

  /**
   * The provider reviewed the overview after onboarding and confirmed the
   * data. Idempotent; requires a completed onboarding.
   */
  async confirm(userId: string): Promise<ProviderOnboardingStatus> {
    const status = await this.getStatus(userId);

    if (status.profileConfirmedAt) return status;

    if (!status.completedAt) {
      throw new ConflictException({
        code: 'ONBOARDING_INCOMPLETE',
        message: 'Finish onboarding before confirming your profile.',
      });
    }

    const { profileConfirmedAt } =
      await this.onboardingRepository.markConfirmed(userId, new Date());

    return { ...status, profileConfirmedAt };
  }
}
