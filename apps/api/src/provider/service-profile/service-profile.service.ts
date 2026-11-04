import { Injectable } from '@nestjs/common';
import { TaskPreference } from '../../../generated/prisma/client.js';
import { ProviderRepository } from '../provider.repository';
import {
  ProviderServiceProfileRepository,
  type ProviderServiceProfileRecord,
} from './service-profile.repository';
import type { ProviderServiceProfileEnvelope } from './service-profile.types';
import { validateServiceProfilePayload } from './service-profile.validation';

const lower = (value: string) => value.toLowerCase();

/**
 * Provider onboarding step 2 — services offered, skills & experience and job
 * interests. Saved and read independently from step 1; the caller's user id
 * (already verified as a provider) scopes every operation.
 */
@Injectable()
export class ProviderServiceProfileService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly serviceProfileRepository: ProviderServiceProfileRepository,
  ) {}

  async get(userId: string): Promise<ProviderServiceProfileEnvelope> {
    await this.providerRepository.ensureByUserId(userId);
    const record = await this.serviceProfileRepository.findByUserId(userId);
    return this.toEnvelope(record);
  }

  async save(
    userId: string,
    rawPayload: unknown,
  ): Promise<ProviderServiceProfileEnvelope> {
    await this.providerRepository.ensureByUserId(userId);
    const input = validateServiceProfilePayload(rawPayload);
    const record = await this.serviceProfileRepository.replaceByUserId(
      userId,
      input,
    );
    return this.toEnvelope(record);
  }

  private toEnvelope(
    record: ProviderServiceProfileRecord | null,
  ): ProviderServiceProfileEnvelope {
    const scalars = record?.providerServiceProfile;
    if (!record || !scalars) {
      return { completed: false, profile: null };
    }

    return {
      completed: true,
      profile: {
        careServices: record.providerCareServices.map((row) =>
          lower(row.service),
        ),
        otherCareService: scalars.otherCareService,
        skills: record.providerSkills.map((row) => lower(row.skill)),
        otherSkill: scalars.otherSkill,
        yearsOfExperience: scalars.yearsOfExperience,
        previousCareExperience: scalars.previousCareExperience,
        qualifications: record.providerQualifications.map((row) =>
          lower(row.qualification),
        ),
        otherQualification: scalars.otherQualification,
        languages: record.providerLanguages.map((row) => lower(row.language)),
        otherLanguage: scalars.otherLanguage,
        coverLetter: scalars.coverLetter,
        jobCategories: record.providerJobCategories.map((row) =>
          lower(row.category),
        ),
        tasksWilling: record.providerTaskPreferences
          .filter((row) => row.preference === TaskPreference.WILLING)
          .map((row) => lower(row.task)),
        tasksUnwilling: record.providerTaskPreferences
          .filter((row) => row.preference === TaskPreference.UNWILLING)
          .map((row) => lower(row.task)),
        clientGroups: record.providerClientGroups.map((row) =>
          lower(row.clientGroup),
        ),
        createdAt: scalars.createdAt,
        updatedAt: scalars.updatedAt,
      },
    };
  }
}
