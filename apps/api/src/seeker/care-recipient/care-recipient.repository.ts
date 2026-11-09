import { Injectable } from '@nestjs/common';
import { CareForType } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import { isOnBehalfAccount } from '../on-behalf-account';
import type { CareRecipientInput } from './care-recipient.types';

/** Care-profile columns of `seekers_info` written by step 2. */
const CARE_PROFILE_SELECT = {
  livingSituation: true,
  mobilityLevel: true,
  languagesSpoken: true,
  otherLanguage: true,
  ethnicBackground: true,
  additionalInfo: true,
} as const;

@Injectable()
export class CareRecipientRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Accounts opened on behalf of someone else have a registrant row. */
  isOnBehalfAccount(userId: string): Promise<boolean> {
    return isOnBehalfAccount(this.prisma, userId);
  }

  async find(userId: string) {
    const [careRecipient, careProfile] = await Promise.all([
      this.prisma.careRecipient.findUnique({ where: { userId } }),
      this.prisma.seekersInfo.findUnique({
        where: { userId },
        select: CARE_PROFILE_SELECT,
      }),
    ]);

    return { careRecipient, careProfile };
  }

  /**
   * Writes identity (`care_recipients`) and care profile (`seekers_info`) in
   * one transaction so step 2 is either fully saved or not at all.
   */
  async save(userId: string, input: CareRecipientInput) {
    const identity = {
      name: input.name,
      surname: input.surname,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      addressLine1: input.addressLine1,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
    };
    const careProfile = {
      livingSituation: input.livingSituation,
      mobilityLevel: input.mobilityLevel,
      languagesSpoken: input.languagesSpoken,
      otherLanguage: input.otherLanguage,
      ethnicBackground: input.ethnicBackground,
      additionalInfo: input.additionalInfo,
    };

    const [careRecipient, savedProfile] = await this.prisma.$transaction([
      this.prisma.careRecipient.upsert({
        where: { userId },
        create: { userId, ...identity },
        update: identity,
      }),
      this.prisma.seekersInfo.upsert({
        where: { userId },
        create: { userId, careFor: CareForType.OTHER, ...careProfile },
        update: careProfile,
        select: CARE_PROFILE_SELECT,
      }),
    ]);

    return { careRecipient, careProfile: savedProfile };
  }
}
