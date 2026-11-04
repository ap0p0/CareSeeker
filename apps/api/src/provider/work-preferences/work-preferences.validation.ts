import { BadRequestException } from '@nestjs/common';
import {
  AvailabilityStart,
  DayAvailabilityMode,
  VehicleType,
  WorkType,
} from '../../../generated/prisma/client.js';
import type {
  ProviderWorkPreferencesInput,
  TimeWindow,
  WorkingDayInput,
} from './work-preferences.types';

export const MAX_TRAVEL_DISTANCE_MILES = 100;
export const MAX_WEEKLY_HOURS = 168;
export const MAX_HOURLY_RATE_CENTS = 500 * 100;
export const MATCHING_NOTES_MAX_LENGTH = 1000;
const MAX_WINDOWS_PER_DAY = 6;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const enumSet = <T extends string>(values: T[]) => new Set<string>(values);
const WORK_TYPES = enumSet(Object.values(WorkType));
const AVAILABILITY_STARTS = enumSet(Object.values(AvailabilityStart));
const VEHICLE_TYPES = enumSet(Object.values(VehicleType));
const DAY_MODES = enumSet(Object.values(DayAvailabilityMode));

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

function parseBoolean(
  value: unknown,
  field: string,
  errors: string[],
): boolean {
  if (typeof value === 'boolean') return value;
  errors.push(`${field} must be true or false`);
  return false;
}

function parseInteger(
  value: unknown,
  field: string,
  errors: string[],
  min: number,
  max: number,
): number | null {
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;
  if (!Number.isInteger(number) || number < min || number > max) {
    errors.push(`${field} must be a whole number between ${min} and ${max}`);
    return null;
  }
  return number;
}

const MINUTES_PER_DAY = 24 * 60;

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Window as minutes from the day's midnight; overnight ends exceed 24h. */
function windowRange(window: TimeWindow): { start: number; end: number } {
  return {
    start: toMinutes(window.start),
    end: toMinutes(window.end) + (window.endsNextDay ? MINUTES_PER_DAY : 0),
  };
}

function parseWindow(
  value: unknown,
  field: string,
  errors: string[],
): TimeWindow | null {
  if (!isRecord(value)) {
    errors.push(`${field} must be an object with start and end`);
    return null;
  }
  const start = typeof value.start === 'string' ? value.start.trim() : '';
  const end = typeof value.end === 'string' ? value.end.trim() : '';
  const endsNextDay = value.endsNextDay === true;
  if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
    errors.push(`${field} times must be in HH:mm format`);
    return null;
  }
  if (
    typeof value.endsNextDay !== 'undefined' &&
    typeof value.endsNextDay !== 'boolean'
  ) {
    errors.push(`${field}.endsNextDay must be true or false`);
    return null;
  }
  if (!endsNextDay && start >= end) {
    errors.push(
      `${field} must end after it starts (set endsNextDay for overnight hours)`,
    );
    return null;
  }
  if (endsNextDay && end > start) {
    errors.push(`${field} cannot be longer than 24 hours`);
    return null;
  }
  return { start, end, endsNextDay };
}

/**
 * Working days: each weekday at most once; windows required for the window
 * modes, forbidden for ALL_DAY; windows sorted and non-overlapping.
 */
function parseWorkingDays(value: unknown, errors: string[]): WorkingDayInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push('workingDays must include at least one day');
    return [];
  }

  const seen = new Set<number>();
  const days: WorkingDayInput[] = [];

  value.forEach((entry, index) => {
    const field = `workingDays[${index}]`;
    if (!isRecord(entry)) {
      errors.push(`${field} must be an object`);
      return;
    }

    const dayOfWeek = parseInteger(
      entry.dayOfWeek,
      `${field}.dayOfWeek`,
      errors,
      0,
      6,
    );
    if (dayOfWeek === null) return;
    if (seen.has(dayOfWeek)) {
      errors.push(`${field}.dayOfWeek ${dayOfWeek} is listed more than once`);
      return;
    }
    seen.add(dayOfWeek);

    const mode = parseEnum<DayAvailabilityMode>(
      entry.mode,
      `${field}.mode`,
      DAY_MODES,
      errors,
    );
    if (!mode) return;

    const rawWindows = Array.isArray(entry.windows) ? entry.windows : [];
    if (mode === DayAvailabilityMode.ALL_DAY) {
      days.push({ dayOfWeek, mode, windows: [] });
      return;
    }

    if (rawWindows.length === 0) {
      errors.push(
        `${field}.windows must include at least one time window for this mode`,
      );
      return;
    }
    if (rawWindows.length > MAX_WINDOWS_PER_DAY) {
      errors.push(
        `${field}.windows may include at most ${MAX_WINDOWS_PER_DAY} windows`,
      );
      return;
    }

    const windows = rawWindows
      .map((window, windowIndex) =>
        parseWindow(window, `${field}.windows[${windowIndex}]`, errors),
      )
      .filter((window): window is TimeWindow => window !== null)
      .sort((a, b) => a.start.localeCompare(b.start));

    for (let i = 1; i < windows.length; i += 1) {
      if (windowRange(windows[i]).start < windowRange(windows[i - 1]).end) {
        errors.push(`${field}.windows must not overlap`);
        break;
      }
    }

    days.push({ dayOfWeek, mode, windows });
  });

  return days.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
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

  const workingDays = parseWorkingDays(body.workingDays, errors);
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
