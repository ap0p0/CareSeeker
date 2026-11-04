import { Injectable } from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import {
  ProviderWorkPreferencesRepository,
  type ProviderWorkPreferencesRecord,
} from './work-preferences.repository';
import type {
  ProviderWorkPreferencesEnvelope,
  TimeWindow,
} from './work-preferences.types';
import { validateWorkPreferencesPayload } from './work-preferences.validation';

const lower = (value: string) => value.toLowerCase();

/**
 * Provider onboarding step 4 — weekly availability and working conditions.
 * Read and replaced independently of the other steps (onboarding and later
 * profile editing use the same endpoints); always scoped to the caller.
 */
@Injectable()
export class ProviderWorkPreferencesService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly workPreferencesRepository: ProviderWorkPreferencesRepository,
  ) {}

  async get(userId: string): Promise<ProviderWorkPreferencesEnvelope> {
    await this.providerRepository.ensureByUserId(userId);
    const record = await this.workPreferencesRepository.findByUserId(userId);
    return this.toEnvelope(record);
  }

  async save(
    userId: string,
    rawPayload: unknown,
  ): Promise<ProviderWorkPreferencesEnvelope> {
    await this.providerRepository.ensureByUserId(userId);
    const input = validateWorkPreferencesPayload(rawPayload);
    const record = await this.workPreferencesRepository.replaceByUserId(
      userId,
      input,
    );
    return this.toEnvelope(record);
  }

  private toEnvelope(
    record: ProviderWorkPreferencesRecord | null,
  ): ProviderWorkPreferencesEnvelope {
    const prefs = record?.providerWorkPreferences;
    if (!record || !prefs) {
      return { completed: false, preferences: null };
    }

    const windowsByDay = new Map<number, TimeWindow[]>();
    for (const window of record.providerAvailabilities) {
      if (window.dayOfWeek === null) continue;
      const list = windowsByDay.get(window.dayOfWeek) ?? [];
      list.push({
        start: window.startTime,
        end: window.endTime,
        endsNextDay: window.endsNextDay,
      });
      windowsByDay.set(window.dayOfWeek, list);
    }

    return {
      completed: true,
      preferences: {
        workingDays: record.providerWorkingDays.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          mode: lower(day.mode),
          windows: windowsByDay.get(day.dayOfWeek) ?? [],
        })),
        workType: lower(prefs.workType),
        availabilityStart: lower(prefs.availabilityStart),
        availableFrom: prefs.availableFrom
          ? prefs.availableFrom.toISOString().slice(0, 10)
          : null,
        acceptsHourly: prefs.acceptsHourly,
        acceptsFixedPrice: prefs.acceptsFixedPrice,
        acceptsOneTimeJobs: prefs.acceptsOneTimeJobs,
        acceptsDailyJobs: prefs.acceptsDailyJobs,
        acceptsWeeklyJobs: prefs.acceptsWeeklyJobs,
        acceptsMonthlyJobs: prefs.acceptsMonthlyJobs,
        availableOvernight: prefs.availableOvernight,
        availableLiveIn: prefs.availableLiveIn,
        availableEmergency: prefs.availableEmergency,
        maxTravelDistanceMiles: prefs.maxTravelDistanceMiles,
        offersTransportation: prefs.offersTransportation,
        vehicleType: prefs.vehicleType ? lower(prefs.vehicleType) : null,
        vehicleWheelchairAccessible: prefs.vehicleWheelchairAccessible,
        minWeeklyHours: prefs.minWeeklyHours,
        maxWeeklyHours: prefs.maxWeeklyHours,
        preferredHourlyRateCents: prefs.preferredHourlyRateCents,
        minHourlyRateCents: prefs.minHourlyRateCents,
        matchingNotes: prefs.matchingNotes,
        createdAt: prefs.createdAt,
        updatedAt: prefs.updatedAt,
      },
    };
  }
}
