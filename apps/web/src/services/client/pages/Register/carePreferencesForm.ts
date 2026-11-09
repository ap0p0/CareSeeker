import dayjs, { type Dayjs } from "dayjs";
import type {
  CareDuration,
  CareFrequency,
  CarePreferences,
  CarePreferencesPayload,
  PaymentType,
} from "../../../../queries/client";
import type { DayModeOption } from "../../../../components/WeeklyScheduleField";
import type { DescribedOption } from "../../../../components/DescribedRadioGroup";
import {
  LANGUAGE_OPTIONS,
  QUALIFICATION_OPTIONS,
  type CareTask,
  type ProfessionalQualification,
  type SpokenLanguage as CareLanguage,
} from "../../../../utils/careOptions";
import { centsToDollars, dollarsToCents } from "../../../../utils/money";
import {
  EMPTY_WEEK_SCHEDULE,
  formatTime,
  timeFromString,
  toScheduleDaysPayload,
  weekScheduleFromSaved,
  type WeekScheduleForm,
} from "../../../../utils/weeklySchedule";
import type {
  CareRecipientForm,
  CareUrgency,
  HomeAccessibility,
  PreferredCaregiverGender,
} from "./types";

/**
 * On-behalf step 3: care needs & assistance preferences. The first answer
 * (`careFrequency`) picks the shape: a one-time visit only needs what it is
 * about, when, and a budget; recurring care adds hours, duration, start and
 * a weekly schedule. Special requirements and caregiver preferences apply to
 * both. Tasks and qualifications use the provider vocabulary
 * (`utils/careOptions`), so requests and caregivers match on the same values.
 */
export type CarePreferencesForm = {
  careFrequency: CareFrequency | "";
  /** The single "what help is needed" question of the flow. */
  careTasks: CareTask[];

  // One-time visit
  visitDate: Dayjs | null;
  visitStart: Dayjs | null;
  visitEnd: Dayjs | null;
  visitNotes: string;

  // Recurring care
  /** As typed; whole number. */
  hoursPerWeek: string;
  careDuration: CareDuration | "";
  careUrgency: CareUrgency | "";
  schedule: WeekScheduleForm;
  needsLiveInCare: boolean;
  needsEmergencyCover: boolean;

  /** The days / hours (or the visit's date / time) can move a little. */
  scheduleFlexible: boolean;

  // Special requirements (the car itself follows from the driving task)
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  homeAccessibility: HomeAccessibility[];
  specialRequirements: string;

  // Budget
  paymentType: PaymentType;
  /** Dollars as typed; required for one-time visits. */
  budget: string;

  // Caregiver preferences
  preferredCaregiverGender: PreferredCaregiverGender | "";
  /** "" = no preference. */
  preferredCaregiverLanguage: CareLanguage | "";
  requiredQualifications: ProfessionalQualification[];
  /** "" = no minimum. */
  minYearsExperience: string;
  culturalConsiderations: string;
};

/** Error keys: form fields plus `days` / `day-<n>` for the schedule. */
export type CarePreferencesErrors = Partial<Record<string, string>>;

export const EMPTY_CARE_PREFERENCES: CarePreferencesForm = {
  careFrequency: "",
  careTasks: [],
  visitDate: null,
  visitStart: null,
  visitEnd: null,
  visitNotes: "",
  hoursPerWeek: "",
  careDuration: "",
  careUrgency: "",
  schedule: EMPTY_WEEK_SCHEDULE,
  needsLiveInCare: false,
  needsEmergencyCover: false,
  scheduleFlexible: false,
  requiresWheelchairAccessibleVehicle: false,
  petsInHome: false,
  homeAccessibility: [],
  specialRequirements: "",
  paymentType: "hourly",
  budget: "",
  preferredCaregiverGender: "",
  preferredCaregiverLanguage: "",
  requiredQualifications: [],
  minYearsExperience: "",
  culturalConsiderations: "",
};

export const isOneTimeCare = (form: CarePreferencesForm): boolean =>
  form.careFrequency === "one_time";

export const isRecurringCare = (form: CarePreferencesForm): boolean =>
  form.careFrequency !== "" && form.careFrequency !== "one_time";

/** Tasks that answer other questions for the user (asked only once). */
export const DRIVING_TASK: CareTask = "transportation_driving";
export const PET_CARE_TASK: CareTask = "pet_care";

// ─── Option catalogues ───────────────────────────────────────────────────────

export const CARE_FREQUENCY_OPTIONS: DescribedOption<CareFrequency>[] = [
  {
    value: "one_time",
    label: "One-time visit",
    description: "Help on one specific day, e.g. a doctor’s appointment.",
  },
  {
    value: "daily",
    label: "Every day",
    description: "Help is needed daily.",
  },
  {
    value: "weekly",
    label: "Some days every week",
    description: "Regular visits on set days of the week.",
  },
  {
    value: "monthly",
    label: "A few times a month",
    description: "Regular, but not every week.",
  },
];

export const CARE_DURATION_OPTIONS: { value: CareDuration; label: string }[] = [
  { value: "short_term", label: "Less than a month" },
  { value: "medium_term", label: "1 to 6 months" },
  { value: "long_term", label: "More than 6 months / ongoing" },
  { value: "not_sure", label: "Not sure yet" },
];

export const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: "hourly", label: "Hourly rate" },
  { value: "fixed_price", label: "Fixed price" },
];

/** What the amount means, per payment type and frequency. */
export const budgetUnit = (
  paymentType: PaymentType,
  oneTime: boolean,
): string =>
  paymentType === "hourly"
    ? "per hour"
    : oneTime
      ? "for the whole visit"
      : "per visit";

/** Seekers ask for care all day or during given hours (no "blocked" hours). */
export const CARE_DAY_MODE_OPTIONS: DayModeOption[] = [
  {
    value: "all_day",
    label: "All day",
    hint: "Care is needed throughout the day.",
  },
  {
    value: "available_windows",
    label: "Specific hours",
    hint: "Add the hours care is needed. Turn on “Ends next day” for overnight hours.",
  },
];

/** "Other" carries no text on this side, so it is not offered. */
export const PREFERRED_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS.filter(
  (option) => option.value !== "other",
);

export const REQUIRED_QUALIFICATION_OPTIONS = QUALIFICATION_OPTIONS.filter(
  (option) => option.value !== "other",
);

export const MIN_EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "No minimum" },
  { value: "1", label: "At least 1 year" },
  { value: "2", label: "At least 2 years" },
  { value: "5", label: "At least 5 years" },
  { value: "10", label: "At least 10 years" },
];

// ─── Prefill from step 2 ─────────────────────────────────────────────────────

/**
 * First values for an empty step 3, derived from what step 2 already says
 * (mobility, languages). Only a starting point: everything stays editable,
 * and saved answers always win.
 */
export const suggestCarePreferences = (
  recipient: CareRecipientForm,
): CarePreferencesForm => {
  const needsHelpMoving =
    recipient.mobilityLevel === "needs_assistance" ||
    recipient.mobilityLevel === "wheelchair" ||
    recipient.mobilityLevel === "bedbound";
  const firstLanguage = recipient.languagesSpoken.find(
    (language) => language !== "other",
  );

  return {
    ...EMPTY_CARE_PREFERENCES,
    careTasks: needsHelpMoving ? ["mobility_transfers"] : [],
    // Only shown if they pick the driving task.
    requiresWheelchairAccessibleVehicle:
      recipient.mobilityLevel === "wheelchair",
    preferredCaregiverLanguage: firstLanguage ?? "",
  };
};

/** Whether the suggestion changed anything worth pointing out. */
export const hasSuggestions = (form: CarePreferencesForm): boolean =>
  form.careTasks.length > 0 || form.preferredCaregiverLanguage !== "";

// ─── Saved data ↔ form ───────────────────────────────────────────────────────

/** Saved step 3 → form. Values the API returns are valid option values. */
export const carePreferencesFormFromSaved = (
  saved: CarePreferences,
): CarePreferencesForm => ({
  ...EMPTY_CARE_PREFERENCES,
  careFrequency: saved.careFrequency,
  careTasks: saved.careTasks,
  visitDate: saved.visit ? dayjs(saved.visit.date) : null,
  visitStart: saved.visit ? timeFromString(saved.visit.startTime) : null,
  visitEnd: saved.visit ? timeFromString(saved.visit.endTime) : null,
  visitNotes: saved.visit?.notes ?? "",
  hoursPerWeek:
    saved.recurring?.hoursPerWeek != null
      ? String(saved.recurring.hoursPerWeek)
      : "",
  careDuration: saved.recurring?.careDuration ?? "",
  careUrgency: (saved.recurring?.careUrgency ?? "") as CareUrgency | "",
  schedule: saved.recurring
    ? weekScheduleFromSaved(saved.recurring.scheduleDays)
    : EMPTY_WEEK_SCHEDULE,
  needsLiveInCare: saved.recurring?.needsLiveInCare ?? false,
  needsEmergencyCover: saved.recurring?.needsEmergencyCover ?? false,
  scheduleFlexible: saved.scheduleFlexible,
  requiresWheelchairAccessibleVehicle:
    saved.requiresWheelchairAccessibleVehicle,
  petsInHome: saved.petsInHome,
  homeAccessibility: saved.homeAccessibility as HomeAccessibility[],
  specialRequirements: saved.specialRequirements ?? "",
  paymentType: saved.budget.paymentType,
  budget:
    saved.budget.amountCents === null
      ? ""
      : centsToDollars(saved.budget.amountCents),
  preferredCaregiverGender: (saved.caregiverPreferences.gender ?? "") as
    | PreferredCaregiverGender
    | "",
  preferredCaregiverLanguage: saved.caregiverPreferences.language ?? "",
  requiredQualifications: saved.caregiverPreferences.requiredQualifications,
  minYearsExperience:
    saved.caregiverPreferences.minYearsExperience === null
      ? ""
      : String(saved.caregiverPreferences.minYearsExperience),
  culturalConsiderations:
    saved.caregiverPreferences.culturalConsiderations ?? "",
});

/** Form → API payload (validated by the step before submitting). */
export const toCarePreferencesPayload = (
  form: CarePreferencesForm,
): CarePreferencesPayload => {
  const oneTime = isOneTimeCare(form);

  return {
    careFrequency: form.careFrequency || "weekly",
    careTasks: form.careTasks,
    ...(oneTime
      ? {
          visit: {
            date: form.visitDate?.format("YYYY-MM-DD") ?? "",
            startTime: form.visitStart ? formatTime(form.visitStart) : "",
            endTime: form.visitEnd ? formatTime(form.visitEnd) : "",
            notes: form.visitNotes.trim() || null,
          },
        }
      : {
          recurring: {
            hoursPerWeek: Number(form.hoursPerWeek),
            careDuration: form.careDuration || "not_sure",
            careUrgency: form.careUrgency,
            scheduleDays: toScheduleDaysPayload(form.schedule),
            needsLiveInCare: form.needsLiveInCare,
            needsEmergencyCover: form.needsEmergencyCover,
          },
        }),
    scheduleFlexible: form.scheduleFlexible,
    requiresWheelchairAccessibleVehicle:
      form.careTasks.includes(DRIVING_TASK) &&
      form.requiresWheelchairAccessibleVehicle,
    petsInHome: form.petsInHome || form.careTasks.includes(PET_CARE_TASK),
    homeAccessibility: form.homeAccessibility,
    specialRequirements: form.specialRequirements.trim() || null,
    budget: {
      paymentType: form.paymentType,
      amountCents: form.budget.trim() ? dollarsToCents(form.budget) : null,
    },
    caregiverPreferences: {
      gender: form.preferredCaregiverGender,
      language: form.preferredCaregiverLanguage || null,
      requiredQualifications: form.requiredQualifications,
      minYearsExperience: form.minYearsExperience
        ? Number(form.minYearsExperience)
        : null,
      culturalConsiderations: form.culturalConsiderations.trim() || null,
    },
  };
};
