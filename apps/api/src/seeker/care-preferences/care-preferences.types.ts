import type {
  CareDuration,
  CareFrequency,
  CareTask,
  CareUrgency,
  HomeAccessibility,
  PaymentType,
  PreferredCaregiverGender,
  ProfessionalQualification,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import type {
  ScheduleDayInput,
  TimeWindow,
} from '../../common/weekly-schedule.validation';

/** A one-time visit: one day, same-day hours (`HH:mm`). */
export type OneTimeVisitInput = {
  /** UTC midnight of the visit day. */
  date: Date;
  startTime: string;
  endTime: string;
  notes: string | null;
};

/** Recurring care: how much, how long, when to start and on which days. */
export type RecurringCareInput = {
  hoursPerWeek: number;
  careDuration: CareDuration;
  careUrgency: CareUrgency;
  scheduleDays: ScheduleDayInput[];
  needsLiveInCare: boolean;
  needsEmergencyCover: boolean;
};

export type BudgetInput = {
  paymentType: PaymentType;
  /** Most the family would pay, in cents. Required for one-time visits. */
  amountCents: number | null;
};

export type CaregiverPreferencesInput = {
  gender: PreferredCaregiverGender;
  /** null = no preference. */
  language: SpokenLanguage | null;
  requiredQualifications: ProfessionalQualification[];
  minYearsExperience: number | null;
  culturalConsiderations: string | null;
};

/**
 * Step 3 of registering on behalf of someone else (care needs & assistance
 * preferences), after validation. Same grouping as the API payload. Exactly
 * one of `visit` (ONE_TIME) and `recurring` (DAILY / WEEKLY / MONTHLY) is
 * set. Stored across `care_preferences`, `care_schedule_days` /
 * `care_schedule_windows` and `seekers_info`.
 */
export type CarePreferencesInput = {
  careFrequency: CareFrequency;
  careTasks: CareTask[];
  visit: OneTimeVisitInput | null;
  recurring: RecurringCareInput | null;
  scheduleFlexible: boolean;
  // Derived from tasks / schedule so the form never asks twice.
  needsOvernightCare: boolean;
  requiresCaregiverVehicle: boolean;
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  homeAccessibility: HomeAccessibility[];
  specialRequirements: string | null;
  budget: BudgetInput;
  caregiverPreferences: CaregiverPreferencesInput;
};

/** API representation: enum values lower-cased, dates `YYYY-MM-DD`. */
export type CarePreferencesResponse = {
  careFrequency: string;
  careTasks: string[];
  /** One-time visits only (otherwise null). */
  visit: {
    date: string;
    startTime: string;
    endTime: string;
    notes: string | null;
  } | null;
  /** Recurring care only (otherwise null). */
  recurring: {
    hoursPerWeek: number | null;
    careDuration: string | null;
    careUrgency: string | null;
    scheduleDays: { dayOfWeek: number; mode: string; windows: TimeWindow[] }[];
    needsLiveInCare: boolean;
    needsEmergencyCover: boolean;
  } | null;
  scheduleFlexible: boolean;
  needsOvernightCare: boolean;
  requiresCaregiverVehicle: boolean;
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  homeAccessibility: string[];
  specialRequirements: string | null;
  budget: { paymentType: string; amountCents: number | null };
  caregiverPreferences: {
    gender: string | null;
    language: string | null;
    requiredQualifications: string[];
    minYearsExperience: number | null;
    culturalConsiderations: string | null;
  };
  updatedAt: Date;
};

/** `GET` / `PUT /seeker/care-preferences`. */
export type CarePreferencesEnvelope = {
  /** `false` until step 3 has been saved once. */
  completed: boolean;
  preferences: CarePreferencesResponse | null;
};
