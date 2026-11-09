import { Injectable } from '@nestjs/common';
import {
  CareForType,
  DisclosePreference,
  Prisma,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import { isOnBehalfAccount } from '../on-behalf-account';
import type { CarePreferencesInput } from './care-preferences.types';

const carePreferencesSelect = {
  carePreferences: true,
  careScheduleDays: { orderBy: { dayOfWeek: 'asc' } },
  careScheduleWindows: {
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    select: {
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      endsNextDay: true,
    },
  },
  seekersInfo: {
    select: {
      careUrgency: true,
      preferredCaregiverGender: true,
      preferredCaregiverLanguage: true,
      homeAccessibility: true,
      culturalConsiderationsNotes: true,
    },
  },
} satisfies Prisma.UserSelect;

export type CarePreferencesRecord = Prisma.UserGetPayload<{
  select: typeof carePreferencesSelect;
}>;

@Injectable()
export class CarePreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  isOnBehalfAccount(userId: string): Promise<boolean> {
    return isOnBehalfAccount(this.prisma, userId);
  }

  findByUserId(userId: string): Promise<CarePreferencesRecord | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: carePreferencesSelect,
    });
  }

  /**
   * Creates or fully replaces step 3 in one transaction: the preferences row
   * is upserted, the seeker-profile answers are written to `seekers_info`
   * and the weekly care schedule is rewritten (emptied for one-time visits).
   */
  async replaceByUserId(
    userId: string,
    input: CarePreferencesInput,
  ): Promise<CarePreferencesRecord> {
    const { visit, recurring, budget, caregiverPreferences } = input;
    const scheduleDays = recurring?.scheduleDays ?? [];

    const preferences = {
      careTasks: input.careTasks,
      careFrequency: input.careFrequency,
      visitDate: visit?.date ?? null,
      visitStartTime: visit?.startTime ?? null,
      visitEndTime: visit?.endTime ?? null,
      visitNotes: visit?.notes ?? null,
      hoursPerWeek: recurring?.hoursPerWeek ?? null,
      careDuration: recurring?.careDuration ?? null,
      scheduleFlexible: input.scheduleFlexible,
      needsOvernightCare: input.needsOvernightCare,
      needsLiveInCare: recurring?.needsLiveInCare ?? false,
      needsEmergencyCover: recurring?.needsEmergencyCover ?? false,
      requiresCaregiverVehicle: input.requiresCaregiverVehicle,
      requiresWheelchairAccessibleVehicle:
        input.requiresWheelchairAccessibleVehicle,
      petsInHome: input.petsInHome,
      specialRequirements: input.specialRequirements,
      requiredQualifications: caregiverPreferences.requiredQualifications,
      minYearsExperience: caregiverPreferences.minYearsExperience,
      paymentType: budget.paymentType,
      budgetCents: budget.amountCents,
    };

    const careProfile = {
      // A one-time visit has a date instead of a start urgency.
      careUrgency: recurring?.careUrgency ?? null,
      preferredCaregiverGender: caregiverPreferences.gender,
      preferredCaregiverLanguage: caregiverPreferences.language,
      homeAccessibility: input.homeAccessibility,
      culturalConsiderationsPreference:
        caregiverPreferences.culturalConsiderations
          ? DisclosePreference.SHARE
          : null,
      culturalConsiderationsNotes: caregiverPreferences.culturalConsiderations,
    };

    return this.prisma.$transaction(async (tx) => {
      await tx.carePreferences.upsert({
        where: { userId },
        create: { userId, ...preferences },
        update: preferences,
      });

      await tx.seekersInfo.upsert({
        where: { userId },
        create: { userId, careFor: CareForType.OTHER, ...careProfile },
        update: careProfile,
      });

      await tx.careScheduleDay.deleteMany({ where: { userId } });
      await tx.careScheduleWindow.deleteMany({ where: { userId } });

      if (scheduleDays.length > 0) {
        await tx.careScheduleDay.createMany({
          data: scheduleDays.map((day) => ({
            userId,
            dayOfWeek: day.dayOfWeek,
            mode: day.mode,
          })),
        });
      }

      const windows = scheduleDays.flatMap((day) =>
        day.windows.map((window) => ({
          userId,
          dayOfWeek: day.dayOfWeek,
          startTime: window.start,
          endTime: window.end,
          endsNextDay: window.endsNextDay,
        })),
      );
      if (windows.length > 0) {
        await tx.careScheduleWindow.createMany({ data: windows });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: carePreferencesSelect,
      });
    });
  }
}
