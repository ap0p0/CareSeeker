import { BadRequestException } from '@nestjs/common';
import {
  CareDuration,
  CareFrequency,
  CareTask,
  CareUrgency,
  DayAvailabilityMode,
  HomeAccessibility,
  PaymentType,
  PreferredCaregiverGender,
  ProfessionalQualification,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import {
  parseBoolean,
  parseInteger,
  parseOptionalInteger,
  parseRequiredEnum,
  parseSelection,
  parseText,
} from '../../common/field-parsers';
import { parseWeeklySchedule } from '../../common/weekly-schedule.validation';
import type {
  BudgetInput,
  CaregiverPreferencesInput,
  CarePreferencesInput,
  OneTimeVisitInput,
  RecurringCareInput,
} from './care-preferences.types';

export const MAX_HOURS_PER_WEEK = 168;
export const MAX_YEARS_EXPERIENCE = 60;
/** Same ceiling as provider rates ($500 / hour). */
export const MAX_HOURLY_BUDGET_CENTS = 500 * 100;
/** $10,000 for a fixed-price visit / per visit. */
export const MAX_FIXED_BUDGET_CENTS = 10_000 * 100;
export const VISIT_NOTES_MAX_LENGTH = 500;
/** One-time visits can be booked up to a year ahead. */
export const MAX_VISIT_DAYS_AHEAD = 365;
export const SPECIAL_REQUIREMENTS_MAX_LENGTH = 1000;
export const CULTURAL_CONSIDERATIONS_MAX_LENGTH = 1000;

/** Seekers ask for care on a whole day or during given hours. */
const SEEKER_DAY_MODES = [
  DayAvailabilityMode.ALL_DAY,
  DayAvailabilityMode.AVAILABLE_WINDOWS,
] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function parsePreferredLanguage(
  value: unknown,
  errors: string[],
): SpokenLanguage | null {
  if (
    typeof value === 'undefined' ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return null;
  }
  // "Other" carries no text on this side, so it cannot be matched on.
  const allowed = Object.values(SpokenLanguage).filter(
    (language) => language !== SpokenLanguage.OTHER,
  );
  return parseRequiredEnum(
    value,
    'caregiverPreferences.language',
    allowed,
    errors,
  );
}

/**
 * `visit: { date, startTime, endTime, notes? }` — a calendar day from today
 * (one day of slack for time zones behind UTC) up to a year ahead, same-day
 * hours with `endTime` after `startTime`.
 */
function parseVisit(
  value: unknown,
  errors: string[],
  today: Date,
): OneTimeVisitInput | null {
  if (!isRecord(value)) {
    errors.push('visit is required for one-time care');
    return null;
  }

  const rawDate = typeof value.date === 'string' ? value.date.trim() : '';
  const match = ISO_DATE_REGEX.exec(rawDate);
  let date: Date | null = null;
  if (!match) {
    errors.push('visit.date must be a date in YYYY-MM-DD format');
  } else {
    const [, year, month, day] = match.map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
    if (
      candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day
    ) {
      errors.push('visit.date must be a valid calendar date');
    } else if (candidate.getTime() < todayUtc - DAY_MS) {
      errors.push('visit.date cannot be in the past');
    } else if (candidate.getTime() > todayUtc + MAX_VISIT_DAYS_AHEAD * DAY_MS) {
      errors.push(
        `visit.date must be within ${MAX_VISIT_DAYS_AHEAD} days from today`,
      );
    } else {
      date = candidate;
    }
  }

  const startTime =
    typeof value.startTime === 'string' ? value.startTime.trim() : '';
  const endTime = typeof value.endTime === 'string' ? value.endTime.trim() : '';
  let timesValid = true;
  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    errors.push('visit.startTime and visit.endTime must be in HH:mm format');
    timesValid = false;
  } else if (startTime >= endTime) {
    errors.push('visit.endTime must be after visit.startTime');
    timesValid = false;
  }

  const notes = parseText(value.notes, 'visit.notes', errors, {
    required: false,
    max: VISIT_NOTES_MAX_LENGTH,
  });

  return date && timesValid ? { date, startTime, endTime, notes } : null;
}

/**
 * `recurring: { hoursPerWeek, careDuration, careUrgency, scheduleDays,
 * needsLiveInCare, needsEmergencyCover }`.
 */
function parseRecurring(
  value: unknown,
  errors: string[],
): RecurringCareInput | null {
  if (!isRecord(value)) {
    errors.push('recurring is required for daily, weekly or monthly care');
    return null;
  }
  const body = value;
  const hoursPerWeek = parseInteger(
    body.hoursPerWeek,
    'recurring.hoursPerWeek',
    errors,
    1,
    MAX_HOURS_PER_WEEK,
  );
  const careDuration = parseRequiredEnum(
    body.careDuration,
    'recurring.careDuration',
    Object.values(CareDuration),
    errors,
  );
  const careUrgency = parseRequiredEnum(
    body.careUrgency,
    'recurring.careUrgency',
    Object.values(CareUrgency),
    errors,
  );
  const scheduleDays = parseWeeklySchedule(
    body.scheduleDays,
    'recurring.scheduleDays',
    errors,
    SEEKER_DAY_MODES,
  );
  const needsLiveInCare = parseBoolean(
    body.needsLiveInCare,
    'recurring.needsLiveInCare',
    errors,
  );
  const needsEmergencyCover = parseBoolean(
    body.needsEmergencyCover,
    'recurring.needsEmergencyCover',
    errors,
  );

  if (hoursPerWeek === null || !careDuration || !careUrgency) return null;
  return {
    hoursPerWeek,
    careDuration,
    careUrgency,
    scheduleDays,
    needsLiveInCare,
    needsEmergencyCover,
  };
}

/**
 * `budget: { paymentType, amountCents }` — hourly (≤ $500) or a fixed price
 * (≤ $10,000); the amount is required for one-time visits, optional for
 * recurring care.
 */
function parseBudget(
  value: unknown,
  oneTime: boolean,
  errors: string[],
): BudgetInput | null {
  if (!isRecord(value)) {
    errors.push('budget.paymentType is required');
    return null;
  }
  const paymentType = parseRequiredEnum(
    value.paymentType,
    'budget.paymentType',
    Object.values(PaymentType),
    errors,
  );
  const max =
    paymentType === PaymentType.FIXED_PRICE
      ? MAX_FIXED_BUDGET_CENTS
      : MAX_HOURLY_BUDGET_CENTS;
  const amountCents = oneTime
    ? parseInteger(value.amountCents, 'budget.amountCents', errors, 1, max)
    : parseOptionalInteger(
        value.amountCents,
        'budget.amountCents',
        errors,
        1,
        max,
      );

  if (!paymentType || (oneTime && amountCents === null)) return null;
  return { paymentType, amountCents };
}

/**
 * `caregiverPreferences: { gender, language?, requiredQualifications?,
 * minYearsExperience?, culturalConsiderations? }` — only `gender` is required.
 */
function parseCaregiverPreferences(
  value: unknown,
  errors: string[],
): CaregiverPreferencesInput | null {
  if (!isRecord(value)) {
    errors.push('caregiverPreferences.gender is required');
    return null;
  }
  const gender = parseRequiredEnum(
    value.gender,
    'caregiverPreferences.gender',
    Object.values(PreferredCaregiverGender),
    errors,
  );
  const language = parsePreferredLanguage(value.language, errors);
  const requiredQualifications = parseSelection(
    value.requiredQualifications,
    'caregiverPreferences.requiredQualifications',
    Object.values(ProfessionalQualification),
    errors,
    { exclude: [ProfessionalQualification.OTHER] },
  );
  const minYearsExperience = parseOptionalInteger(
    value.minYearsExperience,
    'caregiverPreferences.minYearsExperience',
    errors,
    1,
    MAX_YEARS_EXPERIENCE,
  );
  const culturalConsiderations = parseText(
    value.culturalConsiderations,
    'caregiverPreferences.culturalConsiderations',
    errors,
    { required: false, max: CULTURAL_CONSIDERATIONS_MAX_LENGTH },
  );

  if (!gender) return null;
  return {
    gender,
    language,
    requiredQualifications,
    minYearsExperience,
    culturalConsiderations,
  };
}

/**
 * `PUT /seeker/care-preferences` — full replacement of step 3. The shape
 * depends on `careFrequency`: one-time visits send `visit` (and a required
 * budget), recurring care sends hours / duration / start / schedule. Fields
 * of the other shape are ignored. All messages are returned together as a
 * single `400 VALIDATION_ERROR`.
 */
export function validateCarePreferencesPayload(
  rawPayload: unknown,
  today = new Date(),
): CarePreferencesInput {
  if (!isRecord(rawPayload)) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Payload must be an object',
    });
  }

  const body = rawPayload;
  const errors: string[] = [];

  const careTasks = parseSelection(
    body.careTasks,
    'careTasks',
    Object.values(CareTask),
    errors,
    { min: 1 },
  );
  const careFrequency = parseRequiredEnum(
    body.careFrequency,
    'careFrequency',
    Object.values(CareFrequency),
    errors,
  );
  const oneTime = careFrequency === CareFrequency.ONE_TIME;

  const visit = oneTime ? parseVisit(body.visit, errors, today) : null;
  const recurring =
    careFrequency && !oneTime ? parseRecurring(body.recurring, errors) : null;

  const scheduleFlexible = parseBoolean(
    body.scheduleFlexible,
    'scheduleFlexible',
    errors,
  );

  // Special requirements. The car and pets follow from the tasks.
  const requiresCaregiverVehicle = careTasks.includes(
    CareTask.TRANSPORTATION_DRIVING,
  );
  const requiresWheelchairAccessibleVehicle = requiresCaregiverVehicle
    ? parseBoolean(
        body.requiresWheelchairAccessibleVehicle,
        'requiresWheelchairAccessibleVehicle',
        errors,
      )
    : false;
  const petsInHome =
    parseBoolean(body.petsInHome, 'petsInHome', errors) ||
    careTasks.includes(CareTask.PET_CARE);
  const homeAccessibility = parseSelection(
    body.homeAccessibility,
    'homeAccessibility',
    Object.values(HomeAccessibility),
    errors,
  );
  const specialRequirements = parseText(
    body.specialRequirements,
    'specialRequirements',
    errors,
    { required: false, max: SPECIAL_REQUIREMENTS_MAX_LENGTH },
  );

  // Overnight follows from the task or from hours that end the next day.
  const needsOvernightCare =
    careTasks.includes(CareTask.OVERNIGHT_CARE) ||
    (recurring?.scheduleDays.some((day) =>
      day.windows.some((window) => window.endsNextDay),
    ) ??
      false);

  const budget = parseBudget(body.budget, oneTime, errors);
  const caregiverPreferences = parseCaregiverPreferences(
    body.caregiverPreferences,
    errors,
  );

  if (
    errors.length > 0 ||
    !careFrequency ||
    (oneTime ? !visit : !recurring) ||
    !budget ||
    !caregiverPreferences
  ) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid care preferences payload',
      errors,
    });
  }

  return {
    careFrequency,
    careTasks,
    visit,
    recurring,
    scheduleFlexible,
    needsOvernightCare,
    requiresCaregiverVehicle,
    requiresWheelchairAccessibleVehicle,
    petsInHome,
    homeAccessibility,
    specialRequirements,
    budget,
    caregiverPreferences,
  };
}
