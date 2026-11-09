import { ConflictException, Injectable } from '@nestjs/common';
import { CarePreferencesService } from '../care-preferences/care-preferences.service';
import { CareRecipientService } from '../care-recipient/care-recipient.service';
import { RegistrantRepository } from '../registrant/registrant.repository';
import { RegistrantService } from '../registrant/registrant.service';
import { SeekerOnboardingRepository } from './onboarding.repository';
import type { SeekerOnboardingStatus } from './onboarding.types';

/**
 * Registration status of a seeker. For accounts opened on behalf of someone
 * else this is the final "review and confirm" step; self-registered accounts
 * have no such gate (every step saves as it goes).
 */
@Injectable()
export class SeekerOnboardingService {
  constructor(
    private readonly onboardingRepository: SeekerOnboardingRepository,
    private readonly registrantRepository: RegistrantRepository,
    private readonly registrantService: RegistrantService,
    private readonly careRecipientService: CareRecipientService,
    private readonly carePreferencesService: CarePreferencesService,
  ) {}

  async getStatus(userId: string): Promise<SeekerOnboardingStatus> {
    const isOnBehalf =
      (await this.registrantRepository.findByUserId(userId)) !== null;

    if (!isOnBehalf) {
      return {
        careFor: 'self',
        registrant: null,
        careRecipient: null,
        carePreferences: null,
        completedAt: null,
        profileConfirmedAt: null,
      };
    }

    const [registrant, careRecipient, carePreferences, status] =
      await Promise.all([
        this.registrantService.get(userId),
        this.careRecipientService.get(userId),
        this.carePreferencesService.get(userId),
        this.onboardingRepository.getStatus(userId),
      ]);

    return {
      careFor: 'other',
      registrant,
      careRecipient: careRecipient.careRecipient,
      carePreferences: carePreferences.preferences,
      completedAt: status?.onboardingCompletedAt ?? null,
      profileConfirmedAt: status?.profileConfirmedAt ?? null,
    };
  }

  private requireOnBehalf(status: SeekerOnboardingStatus) {
    if (status.careFor !== 'other') {
      throw new ConflictException({
        code: 'NOT_ON_BEHALF_ACCOUNT',
        message:
          'The review step only applies to accounts opened on behalf of someone else.',
      });
    }
  }

  /**
   * Marks the flow as finished: the care recipient and the care preferences
   * must be saved. Idempotent: completing twice keeps the first timestamp.
   */
  async complete(userId: string): Promise<SeekerOnboardingStatus> {
    const status = await this.getStatus(userId);
    this.requireOnBehalf(status);

    if (status.completedAt) return status;

    if (!status.careRecipient || !status.carePreferences) {
      throw new ConflictException({
        code: 'ONBOARDING_INCOMPLETE',
        message:
          'The person who needs care and their care needs must be saved before finishing registration.',
      });
    }

    const { onboardingCompletedAt } =
      await this.onboardingRepository.markCompleted(userId, new Date());

    return { ...status, completedAt: onboardingCompletedAt };
  }

  /**
   * The seeker reviewed the summary and confirmed the data. Idempotent;
   * requires a completed registration.
   */
  async confirm(userId: string): Promise<SeekerOnboardingStatus> {
    const status = await this.getStatus(userId);
    this.requireOnBehalf(status);

    if (status.profileConfirmedAt) return status;

    if (!status.completedAt) {
      throw new ConflictException({
        code: 'ONBOARDING_INCOMPLETE',
        message: 'Finish registration before confirming your details.',
      });
    }

    const { profileConfirmedAt } =
      await this.onboardingRepository.markConfirmed(userId, new Date());

    return { ...status, profileConfirmedAt };
  }
}
