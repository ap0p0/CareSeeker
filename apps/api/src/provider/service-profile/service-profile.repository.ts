import { Injectable } from '@nestjs/common';
import { Prisma, TaskPreference } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { ProviderServiceProfileInput } from './service-profile.types';

const serviceProfileSelect = {
  providerServiceProfile: true,
  providerCareServices: { select: { service: true } },
  providerSkills: { select: { skill: true } },
  providerQualifications: { select: { qualification: true } },
  providerLanguages: { select: { language: true } },
  providerJobCategories: { select: { category: true } },
  providerTaskPreferences: { select: { task: true, preference: true } },
  providerClientGroups: { select: { clientGroup: true } },
} satisfies Prisma.UserSelect;

export type ProviderServiceProfileRecord = Prisma.UserGetPayload<{
  select: typeof serviceProfileSelect;
}>;

@Injectable()
export class ProviderServiceProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<ProviderServiceProfileRecord | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: serviceProfileSelect,
    });
  }

  /**
   * Creates or fully replaces the provider's step 2 data. The scalar row is
   * upserted and every selection table is rewritten inside one transaction,
   * so readers never observe a half-updated profile.
   */
  async replaceByUserId(
    userId: string,
    input: ProviderServiceProfileInput,
  ): Promise<ProviderServiceProfileRecord> {
    const scalars = {
      otherCareService: input.otherCareService,
      otherSkill: input.otherSkill,
      yearsOfExperience: input.yearsOfExperience,
      previousCareExperience: input.previousCareExperience,
      otherQualification: input.otherQualification,
      otherLanguage: input.otherLanguage,
      coverLetter: input.coverLetter,
    };

    const where = { providerId: userId };

    return this.prisma.$transaction(async (tx) => {
      await tx.providerServiceProfile.upsert({
        where: { userId },
        create: { userId, ...scalars },
        update: scalars,
      });

      await Promise.all([
        tx.providerCareService.deleteMany({ where }),
        tx.providerSkill.deleteMany({ where }),
        tx.providerQualification.deleteMany({ where }),
        tx.providerLanguage.deleteMany({ where }),
        tx.providerJobCategory.deleteMany({ where }),
        tx.providerTaskPreference.deleteMany({ where }),
        tx.providerClientGroup.deleteMany({ where }),
      ]);

      await Promise.all([
        tx.providerCareService.createMany({
          data: input.careServices.map((service) => ({
            providerId: userId,
            service,
          })),
        }),
        tx.providerSkill.createMany({
          data: input.skills.map((skill) => ({ providerId: userId, skill })),
        }),
        tx.providerQualification.createMany({
          data: input.qualifications.map((qualification) => ({
            providerId: userId,
            qualification,
          })),
        }),
        tx.providerLanguage.createMany({
          data: input.languages.map((language) => ({
            providerId: userId,
            language,
          })),
        }),
        tx.providerJobCategory.createMany({
          data: input.jobCategories.map((category) => ({
            providerId: userId,
            category,
          })),
        }),
        tx.providerTaskPreference.createMany({
          data: [
            ...input.tasksWilling.map((task) => ({
              providerId: userId,
              task,
              preference: TaskPreference.WILLING,
            })),
            ...input.tasksUnwilling.map((task) => ({
              providerId: userId,
              task,
              preference: TaskPreference.UNWILLING,
            })),
          ],
        }),
        tx.providerClientGroup.createMany({
          data: input.clientGroups.map((clientGroup) => ({
            providerId: userId,
            clientGroup,
          })),
        }),
      ]);

      const record = await tx.user.findUnique({
        where: { id: userId },
        select: serviceProfileSelect,
      });

      if (!record) {
        throw new Error(
          'Provider user disappeared during service profile update',
        );
      }

      return record;
    });
  }
}
