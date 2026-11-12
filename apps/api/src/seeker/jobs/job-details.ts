import {
  CareFrequency,
  type CareDuration,
  type CareTask,
  type CareUrgency,
  type DayAvailabilityMode,
  type HomeAccessibility,
  type PaymentType,
  type PreferredCaregiverGender,
  type ProfessionalQualification,
  type SpokenLanguage,
} from '../../../generated/prisma/client.js';
import { formatIsoDate } from '../../common/personal-info.validation';
import type { ScheduleDayInput } from '../../common/weekly-schedule.validation';
import type { JobDetails, JobDetailsResponse } from './jobs.types';

type ScheduleDayRow = { dayOfWeek: number; mode: DayAvailabilityMode };
type ScheduleWindowRow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  endsNextDay: boolean;
};

/**
 * The care-detail columns shared by `care_preferences` and `jobs` (same
 * names and types), plus the answers a profile keeps in `seekers_info`.
 */
type CareDetailColumns = {
  careFrequency: CareFrequency;
  careTasks: CareTask[];
  visitDate: Date | null;
  visitStartTime: string | null;
  visitEndTime: string | null;
  visitNotes: string | null;
  hoursPerWeek: number | null;
  careDuration: CareDuration | null;
  scheduleFlexible: boolean;
  needsOvernightCare: boolean;
  needsLiveInCare: boolean;
  needsEmergencyCover: boolean;
  requiresCaregiverVehicle: boolean;
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  specialRequirements: string | null;
  requiredQualifications: ProfessionalQualification[];
  minYearsExperience: number | null;
  paymentType: PaymentType;
  budgetCents: number | null;
};

type ProfileAnswers = {
  careUrgency: CareUrgency | null;
  preferredCaregiverGender: PreferredCaregiverGender | null;
  preferredCaregiverLanguage: SpokenLanguage | null;
  homeAccessibility: HomeAccessibility[];
  culturalConsiderations: string | null;
};

/** Schedule rows (days + windows, any order) → validated-input shape. */
export function scheduleFromRows(
  days: readonly ScheduleDayRow[],
  windows: readonly ScheduleWindowRow[],
): ScheduleDayInput[] {
  return [...days]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((day) => ({
      dayOfWeek: day.dayOfWeek,
      mode: day.mode,
      windows: windows
        .filter((window) => window.dayOfWeek === day.dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((window) => ({
          start: window.startTime,
          end: window.endTime,
          endsNextDay: window.endsNextDay,
        })),
    }));
}

function detailsFromColumns(
  columns: CareDetailColumns,
  answers: ProfileAnswers,
  scheduleDays: ScheduleDayInput[],
): JobDetails {
  const oneTime = columns.careFrequency === CareFrequency.ONE_TIME;

  return {
    careFrequency: columns.careFrequency,
    careTasks: [...columns.careTasks],
    visit:
      oneTime &&
      columns.visitDate &&
      columns.visitStartTime &&
      columns.visitEndTime
        ? {
            date: columns.visitDate,
            startTime: columns.visitStartTime,
            endTime: columns.visitEndTime,
            notes: columns.visitNotes,
          }
        : null,
    recurring: oneTime
      ? null
      : {
          hoursPerWeek: columns.hoursPerWeek,
          careDuration: columns.careDuration,
          careUrgency: answers.careUrgency,
          scheduleDays,
          needsLiveInCare: columns.needsLiveInCare,
          needsEmergencyCover: columns.needsEmergencyCover,
        },
    scheduleFlexible: columns.scheduleFlexible,
    needsOvernightCare: columns.needsOvernightCare,
    requiresCaregiverVehicle: columns.requiresCaregiverVehicle,
    requiresWheelchairAccessibleVehicle:
      columns.requiresWheelchairAccessibleVehicle,
    petsInHome: columns.petsInHome,
    homeAccessibility: [...answers.homeAccessibility],
    specialRequirements: columns.specialRequirements,
    budget: {
      paymentType: columns.paymentType,
      amountCents: columns.budgetCents,
    },
    caregiverPreferences: {
      gender: answers.preferredCaregiverGender,
      language: answers.preferredCaregiverLanguage,
      requiredQualifications: [...columns.requiredQualifications],
      minYearsExperience: columns.minYearsExperience,
      culturalConsiderations: answers.culturalConsiderations,
    },
  };
}

/**
 * Saved care preferences (registration step 3) → job details: the prefill
 * of a new job post. Start urgency, caregiver gender / language, home
 * accessibility and cultural considerations live in `seekers_info`.
 */
export function jobDetailsFromProfile(profile: {
  carePreferences: CareDetailColumns;
  seekersInfo: {
    careUrgency: CareUrgency | null;
    preferredCaregiverGender: PreferredCaregiverGender | null;
    preferredCaregiverLanguage: SpokenLanguage | null;
    homeAccessibility: HomeAccessibility[];
    culturalConsiderationsNotes: string | null;
  } | null;
  careScheduleDays: ScheduleDayRow[];
  careScheduleWindows: ScheduleWindowRow[];
}): JobDetails {
  const info = profile.seekersInfo;
  return detailsFromColumns(
    profile.carePreferences,
    {
      careUrgency: info?.careUrgency ?? null,
      preferredCaregiverGender: info?.preferredCaregiverGender ?? null,
      preferredCaregiverLanguage: info?.preferredCaregiverLanguage ?? null,
      homeAccessibility: info?.homeAccessibility ?? [],
      culturalConsiderations: info?.culturalConsiderationsNotes ?? null,
    },
    scheduleFromRows(profile.careScheduleDays, profile.careScheduleWindows),
  );
}

/** A saved job → its details; `null` for jobs without care details. */
export function jobDetailsFromJob(
  job: Omit<CareDetailColumns, 'careFrequency' | 'paymentType'> & {
    careFrequency: CareFrequency | null;
    paymentType: PaymentType | null;
    careUrgency: CareUrgency | null;
    preferredCaregiverGender: PreferredCaregiverGender | null;
    preferredCaregiverLanguage: SpokenLanguage | null;
    homeAccessibility: HomeAccessibility[];
    culturalConsiderations: string | null;
    scheduleDays: ScheduleDayRow[];
    scheduleWindows: ScheduleWindowRow[];
  },
): JobDetails | null {
  const { careFrequency, paymentType } = job;
  if (!careFrequency || !paymentType) return null;

  return detailsFromColumns(
    { ...job, careFrequency, paymentType },
    job,
    scheduleFromRows(job.scheduleDays, job.scheduleWindows),
  );
}

const lower = (value: string | null): string | null =>
  value ? value.toLowerCase() : null;
const lowerAll = (values: readonly string[]): string[] =>
  values.map((value) => value.toLowerCase());

/**
 * API representation: the `GET /seeker/care-preferences` shape (enum values
 * lower-cased, dates `YYYY-MM-DD`), so the client reuses one form model.
 */
export function serializeJobDetails(details: JobDetails): JobDetailsResponse {
  const { visit, recurring, budget, caregiverPreferences } = details;

  return {
    careFrequency: details.careFrequency.toLowerCase(),
    careTasks: lowerAll(details.careTasks),
    visit: visit
      ? {
          date: formatIsoDate(visit.date),
          startTime: visit.startTime,
          endTime: visit.endTime,
          notes: visit.notes,
        }
      : null,
    recurring: recurring
      ? {
          hoursPerWeek: recurring.hoursPerWeek,
          careDuration: lower(recurring.careDuration),
          careUrgency: lower(recurring.careUrgency),
          scheduleDays: recurring.scheduleDays.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            mode: day.mode.toLowerCase(),
            windows: day.windows.map((window) => ({ ...window })),
          })),
          needsLiveInCare: recurring.needsLiveInCare,
          needsEmergencyCover: recurring.needsEmergencyCover,
        }
      : null,
    scheduleFlexible: details.scheduleFlexible,
    needsOvernightCare: details.needsOvernightCare,
    requiresCaregiverVehicle: details.requiresCaregiverVehicle,
    requiresWheelchairAccessibleVehicle:
      details.requiresWheelchairAccessibleVehicle,
    petsInHome: details.petsInHome,
    homeAccessibility: lowerAll(details.homeAccessibility),
    specialRequirements: details.specialRequirements,
    budget: {
      paymentType: budget.paymentType.toLowerCase(),
      amountCents: budget.amountCents,
    },
    caregiverPreferences: {
      gender: lower(caregiverPreferences.gender),
      language: lower(caregiverPreferences.language),
      requiredQualifications: lowerAll(
        caregiverPreferences.requiredQualifications,
      ),
      minYearsExperience: caregiverPreferences.minYearsExperience,
      culturalConsiderations: caregiverPreferences.culturalConsiderations,
    },
  };
}
