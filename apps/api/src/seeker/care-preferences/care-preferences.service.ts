import { Injectable } from '@nestjs/common';
import { CareFrequency } from '../../../generated/prisma/client.js';
import { formatIsoDate } from '../../common/personal-info.validation';
import { notOnBehalfAccountError } from '../on-behalf-account';
import {
  CarePreferencesRepository,
  type CarePreferencesRecord,
} from './care-preferences.repository';
import type {
  CarePreferencesEnvelope,
  CarePreferencesResponse,
} from './care-preferences.types';
import { validateCarePreferencesPayload } from './care-preferences.validation';

const lower = (value: string | null | undefined): string | null =>
  value ? value.toLowerCase() : null;
const lowerAll = (values: readonly string[]): string[] =>
  values.map((value) => value.toLowerCase());

function toResponse(
  record: CarePreferencesRecord | null,
): CarePreferencesResponse | null {
  const preferences = record?.carePreferences;
  if (!record || !preferences) return null;

  const info = record.seekersInfo;
  const oneTime = preferences.careFrequency === CareFrequency.ONE_TIME;

  return {
    careFrequency: preferences.careFrequency.toLowerCase(),
    careTasks: lowerAll(preferences.careTasks),
    visit:
      oneTime &&
      preferences.visitDate &&
      preferences.visitStartTime &&
      preferences.visitEndTime
        ? {
            date: formatIsoDate(preferences.visitDate),
            startTime: preferences.visitStartTime,
            endTime: preferences.visitEndTime,
            notes: preferences.visitNotes,
          }
        : null,
    recurring: oneTime
      ? null
      : {
          hoursPerWeek: preferences.hoursPerWeek,
          careDuration: lower(preferences.careDuration),
          careUrgency: lower(info?.careUrgency),
          scheduleDays: record.careScheduleDays.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            mode: day.mode.toLowerCase(),
            windows: record.careScheduleWindows
              .filter((window) => window.dayOfWeek === day.dayOfWeek)
              .map((window) => ({
                start: window.startTime,
                end: window.endTime,
                endsNextDay: window.endsNextDay,
              })),
          })),
          needsLiveInCare: preferences.needsLiveInCare,
          needsEmergencyCover: preferences.needsEmergencyCover,
        },
    scheduleFlexible: preferences.scheduleFlexible,
    needsOvernightCare: preferences.needsOvernightCare,
    requiresCaregiverVehicle: preferences.requiresCaregiverVehicle,
    requiresWheelchairAccessibleVehicle:
      preferences.requiresWheelchairAccessibleVehicle,
    petsInHome: preferences.petsInHome,
    homeAccessibility: lowerAll(info?.homeAccessibility ?? []),
    specialRequirements: preferences.specialRequirements,
    budget: {
      paymentType: preferences.paymentType.toLowerCase(),
      amountCents: preferences.budgetCents,
    },
    caregiverPreferences: {
      gender: lower(info?.preferredCaregiverGender),
      language: lower(info?.preferredCaregiverLanguage),
      requiredQualifications: lowerAll(preferences.requiredQualifications),
      minYearsExperience: preferences.minYearsExperience,
      culturalConsiderations: info?.culturalConsiderationsNotes ?? null,
    },
    updatedAt: preferences.updatedAt,
  };
}

/**
 * Step 3 of registering on behalf of someone else: care needs & assistance
 * preferences. Only available to accounts opened on behalf of someone else.
 */
@Injectable()
export class CarePreferencesService {
  constructor(private readonly repository: CarePreferencesRepository) {}

  private async requireOnBehalfAccount(userId: string) {
    if (!(await this.repository.isOnBehalfAccount(userId))) {
      throw notOnBehalfAccountError('Care preferences');
    }
  }

  async get(userId: string): Promise<CarePreferencesEnvelope> {
    await this.requireOnBehalfAccount(userId);
    const preferences = toResponse(await this.repository.findByUserId(userId));
    return { completed: preferences !== null, preferences };
  }

  async save(
    userId: string,
    rawPayload: unknown,
  ): Promise<CarePreferencesEnvelope> {
    await this.requireOnBehalfAccount(userId);
    const input = validateCarePreferencesPayload(rawPayload);
    const record = await this.repository.replaceByUserId(userId, input);
    return { completed: true, preferences: toResponse(record) };
  }
}
