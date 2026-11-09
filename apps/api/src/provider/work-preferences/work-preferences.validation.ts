import { BadRequestException } from '@nestjs/common';
import {
  AvailabilityStart,
  VehicleType,
  WorkType,
} from '../../../generated/prisma/client.js';
import { parseBoolean, parseInteger } from '../../common/field-parsers';
import { parseWeeklySchedule } from '../../common/weekly-schedule.validation';
import type { ProviderWorkPreferencesInput } from './work-preferences.types';

export const MAX_TRAVEL_DISTANCE_MILES = 100;
export const MAX_WEEKLY_HOURS = 168;
export const MAX_HOURLY_RATE_CENTS = 500 * 100;
export const MATCHING_NOTES_MAX_LENGTH = 1000;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const enumSet = <T extends string>(values: T[]) => new Set<string>(values);
const WORK_TYPES = enumSet(Object.values(WorkType));
const AVAILABILITY_STARTS = enumSet(Object.values(AvailabilityStart));
const VEHICLE_TYPES = enumSet(Object.values(VehicleType));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function parseEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: Set<string>,
  errors: string[],
): T | null {
  const normalized =
    typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!normalized) {
    errors.push(`${field} is required`);
    return null;
  }
  if (!allowed.has(normalized)) {
    errors.push(
      `${field} must be one of: ${Array.from(allowed)
        .map((item) => item.toLowerCase())
        .join(', ')}`,
    );
    return null;
  }
  return normalized as T;
}

export function validateWorkPreferencesPayload(
  rawPayload: unknown,
): ProviderWorkPreferencesInput {
  if (!isRecord(rawPayload)) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Payload must be an object',
    });
  }

  const body = rawPayload;
  const errors: string[] = [];

  // Providers may describe a day by available or by blocked hours.
  const workingDays = parseWeeklySchedule(
    body.workingDays,
    'workingDays',
    errors,
  );
  const workType = parseEnum<WorkType>(
    body.workType,
    'workType',
    WORK_TYPES,
    errors,
  );
  const availabilityStart = parseEnum<AvailabilityStart>(
    body.availabilityStart,
    'availabilityStart',
    AVAILABILITY_STARTS,
    errors,
  );

  let availableFrom: Date | null = null;
  if (availabilityStart === AvailabilityStart.SPECIFIC_DATE) {
    const raw =
      typeof body.availableFrom === 'string' ? body.availableFrom.trim() : '';
    const date = ISO_DATE_REGEX.test(raw)
      ? new Date(`${raw}T00:00:00.000Z`)
      : null;
    if (!date || Number.isNaN(date.getTime())) {
      errors.push(
        'availableFrom must be a date in YYYY-MM-DD format when availabilityStart is specific_date',
      );
    } else {
      const today = new Date();
      const todayUtc = Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
      );
      if (date.getTime() < todayUtc) {
        errors.push('availableFrom cannot be in the past');
      } else {
        availableFrom = date;
      }
    }
  }

  const acceptsHourly = parseBoolean(
    body.acceptsHourly,
    'acceptsHourly',
    errors,
  );
  const acceptsFixedPrice = parseBoolean(
    body.acceptsFixedPrice,
    'acceptsFixedPrice',
    errors,
  );
  if (!acceptsHourly && !acceptsFixedPrice) {
    errors.push(
      'At least one of acceptsHourly or acceptsFixedPrice must be true',
    );
  }

  const acceptsOneTimeJobs = parseBoolean(
    body.acceptsOneTimeJobs,
    'acceptsOneTimeJobs',
    errors,
  );
  const acceptsDailyJobs = parseBoolean(
    body.acceptsDailyJobs,
    'acceptsDailyJobs',
    errors,
  );
  const acceptsWeeklyJobs = parseBoolean(
    body.acceptsWeeklyJobs,
    'acceptsWeeklyJobs',
    errors,
  );
  const acceptsMonthlyJobs = parseBoolean(
    body.acceptsMonthlyJobs,
    'acceptsMonthlyJobs',
    errors,
  );
  if (
    !acceptsOneTimeJobs &&
    !acceptsDailyJobs &&
    !acceptsWeeklyJobs &&
    !acceptsMonthlyJobs
  ) {
    errors.push(
      'At least one job frequency (one-time, daily, weekly, monthly) must be accepted',
    );
  }

  const availableOvernight = parseBoolean(
    body.availableOvernight,
    'availableOvernight',
    errors,
  );
  const availableLiveIn = parseBoolean(
    body.availableLiveIn,
    'availableLiveIn',
    errors,
  );
  const availableEmergency = parseBoolean(
    body.availableEmergency,
    'availableEmergency',
    errors,
  );

  const maxTravelDistanceMiles = parseInteger(
    body.maxTravelDistanceMiles,
    'maxTravelDistanceMiles',
    errors,
    1,
    MAX_TRAVEL_DISTANCE_MILES,
  );

  const offersTransportation = parseBoolean(
    body.offersTransportation,
    'offersTransportation',
    errors,
  );
  let vehicleType: VehicleType | null = null;
  let vehicleWheelchairAccessible: boolean | null = null;
  if (offersTransportation) {
    vehicleType = parseEnum<VehicleType>(
      body.vehicleType,
      'vehicleType',
      VEHICLE_TYPES,
      errors,
    );
    vehicleWheelchairAccessible = parseBoolean(
      body.vehicleWheelchairAccessible,
      'vehicleWheelchairAccessible',
      errors,
    );
  }

  const minWeeklyHours = parseInteger(
    body.minWeeklyHours,
    'minWeeklyHours',
    errors,
    1,
    MAX_WEEKLY_HOURS,
  );
  const maxWeeklyHours = parseInteger(
    body.maxWeeklyHours,
    'maxWeeklyHours',
    errors,
    1,
    MAX_WEEKLY_HOURS,
  );
  if (
    minWeeklyHours !== null &&
    maxWeeklyHours !== null &&
    minWeeklyHours > maxWeeklyHours
  ) {
    errors.push('minWeeklyHours cannot exceed maxWeeklyHours');
  }

  const preferredHourlyRateCents = parseInteger(
    body.preferredHourlyRateCents,
    'preferredHourlyRateCents',
    errors,
    1,
    MAX_HOURLY_RATE_CENTS,
  );
  const minHourlyRateCents = parseInteger(
    body.minHourlyRateCents,
    'minHourlyRateCents',
    errors,
    1,
    MAX_HOURLY_RATE_CENTS,
  );
  if (
    preferredHourlyRateCents !== null &&
    minHourlyRateCents !== null &&
    minHourlyRateCents > preferredHourlyRateCents
  ) {
    errors.push('minHourlyRateCents cannot exceed preferredHourlyRateCents');
  }

  let matchingNotes: string | null = null;
  if (
    typeof body.matchingNotes !== 'undefined' &&
    body.matchingNotes !== null
  ) {
    if (typeof body.matchingNotes !== 'string') {
      errors.push('matchingNotes must be a string');
    } else if (body.matchingNotes.trim().length > MATCHING_NOTES_MAX_LENGTH) {
      errors.push(
        `matchingNotes must be at most ${MATCHING_NOTES_MAX_LENGTH} characters`,
      );
    } else {
      matchingNotes = body.matchingNotes.trim() || null;
    }
  }

  if (
    errors.length > 0 ||
    !workType ||
    !availabilityStart ||
    maxTravelDistanceMiles === null ||
    minWeeklyHours === null ||
    maxWeeklyHours === null ||
    preferredHourlyRateCents === null ||
    minHourlyRateCents === null
  ) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid availability & work preferences payload',
      errors,
    });
  }

  return {
    workingDays,
    workType,
    availabilityStart,
    availableFrom,
    acceptsHourly,
    acceptsFixedPrice,
    acceptsOneTimeJobs,
    acceptsDailyJobs,
    acceptsWeeklyJobs,
    acceptsMonthlyJobs,
    availableOvernight,
    availableLiveIn,
    availableEmergency,
    maxTravelDistanceMiles,
    offersTransportation,
    vehicleType,
    vehicleWheelchairAccessible,
    minWeeklyHours,
    maxWeeklyHours,
    preferredHourlyRateCents,
    minHourlyRateCents,
    matchingNotes,
  };
}
