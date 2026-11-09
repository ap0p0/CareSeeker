import { Injectable } from '@nestjs/common';
import { formatIsoDate } from '../../common/personal-info.validation';
import { notOnBehalfAccountError } from '../on-behalf-account';
import { CareRecipientRepository } from './care-recipient.repository';
import type {
  CareRecipientResponse,
  CareRecipientStatusResponse,
} from './care-recipient.types';
import { validateCareRecipientPayload } from './care-recipient.validation';

type StoredCareRecipient = Awaited<ReturnType<CareRecipientRepository['find']>>;

function lower(value: string | null | undefined): string | null {
  return value ? value.toLowerCase() : null;
}

function toResponse({
  careRecipient,
  careProfile,
}: StoredCareRecipient): CareRecipientResponse | null {
  if (!careRecipient) return null;

  return {
    name: careRecipient.name,
    surname: careRecipient.surname,
    dateOfBirth: formatIsoDate(careRecipient.dateOfBirth),
    gender: careRecipient.gender.toLowerCase(),
    addressLine1: careRecipient.addressLine1,
    city: careRecipient.city,
    state: careRecipient.state,
    postalCode: careRecipient.postalCode,
    livingSituation: lower(careProfile?.livingSituation),
    mobilityLevel: lower(careProfile?.mobilityLevel),
    languagesSpoken: (careProfile?.languagesSpoken ?? []).map((language) =>
      language.toLowerCase(),
    ),
    otherLanguage: careProfile?.otherLanguage ?? null,
    ethnicBackground: lower(careProfile?.ethnicBackground),
    additionalInfo: careProfile?.additionalInfo ?? null,
    updatedAt: careRecipient.updatedAt,
  };
}

/**
 * Step 2 of registering on behalf of someone else: the person receiving
 * care. Only available to accounts opened on behalf of someone else.
 */
@Injectable()
export class CareRecipientService {
  constructor(private readonly repository: CareRecipientRepository) {}

  private async requireOnBehalfAccount(userId: string) {
    if (!(await this.repository.isOnBehalfAccount(userId))) {
      throw notOnBehalfAccountError('Care recipient details');
    }
  }

  async get(userId: string): Promise<CareRecipientStatusResponse> {
    await this.requireOnBehalfAccount(userId);
    const careRecipient = toResponse(await this.repository.find(userId));

    return { completed: careRecipient !== null, careRecipient };
  }

  async save(
    userId: string,
    rawPayload: unknown,
  ): Promise<CareRecipientStatusResponse> {
    await this.requireOnBehalfAccount(userId);
    const input = validateCareRecipientPayload(rawPayload);

    return {
      completed: true,
      careRecipient: toResponse(await this.repository.save(userId, input)),
    };
  }
}
