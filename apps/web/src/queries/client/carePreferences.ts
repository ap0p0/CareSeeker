import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import type {
  CareTask,
  ProfessionalQualification,
  SpokenLanguage,
} from "../../utils/careOptions";
import type { ScheduleDay } from "../../utils/weeklySchedule";
import { requireClientAuthHeaders } from "./authHeaders";
import { ClientAuthApiError } from "./errors";

export const SEEKER_CARE_PREFERENCES_PATH = "/seeker/care-preferences" as const;

/** Mirrors the API `CareFrequency` enum (↔ provider `accepts*Jobs`). */
export type CareFrequency = "one_time" | "daily" | "weekly" | "monthly";

/** Mirrors the API `CareDuration` enum. */
export type CareDuration =
  | "short_term"
  | "medium_term"
  | "long_term"
  | "not_sure";

/** Mirrors the API `PaymentType` enum (↔ provider `acceptsHourly` / `acceptsFixedPrice`). */
export type PaymentType = "hourly" | "fixed_price";

/** A one-time visit: one day, same-day hours (`HH:mm`). */
export type CareVisit = {
  /** `YYYY-MM-DD` */
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
};

/** Recurring care (daily / weekly / monthly). */
export type RecurringCare = {
  hoursPerWeek: number;
  careDuration: CareDuration;
  careUrgency: string;
  /** Only `all_day` / `available_windows` days. */
  scheduleDays: ScheduleDay[];
  needsLiveInCare: boolean;
  needsEmergencyCover: boolean;
};

export type CareBudget = {
  paymentType: PaymentType;
  /** Per hour (hourly) or for the visit / per visit (fixed price). */
  amountCents: number | null;
};

export type CaregiverPreferences = {
  gender: string;
  /** `null` = no preference. */
  language: SpokenLanguage | null;
  requiredQualifications: ProfessionalQualification[];
  minYearsExperience: number | null;
  culturalConsiderations: string | null;
};

/**
 * Step 3 of registering on behalf of someone else: care needs & assistance
 * preferences. `visit` is sent for one-time care, `recurring` otherwise.
 * Tasks and qualifications use the provider vocabulary (`utils/careOptions`)
 * so both sides can be matched directly. The car / overnight / pets flags
 * are derived by the API from the tasks and schedule.
 */
export type CarePreferencesPayload = {
  careFrequency: CareFrequency;
  careTasks: CareTask[];
  visit?: CareVisit;
  recurring?: RecurringCare;
  scheduleFlexible: boolean;
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  homeAccessibility: string[];
  specialRequirements: string | null;
  budget: CareBudget;
  caregiverPreferences: CaregiverPreferences;
};

/** Saved step 3, as returned by `GET` / `PUT`. */
export type CarePreferences = {
  careFrequency: CareFrequency;
  careTasks: CareTask[];
  visit: CareVisit | null;
  recurring:
    | (Omit<RecurringCare, "hoursPerWeek" | "careDuration" | "careUrgency"> & {
        hoursPerWeek: number | null;
        careDuration: CareDuration | null;
        careUrgency: string | null;
      })
    | null;
  scheduleFlexible: boolean;
  /** Derived: overnight task or hours ending the next day. */
  needsOvernightCare: boolean;
  /** Derived: the "Transportation / driving" task. */
  requiresCaregiverVehicle: boolean;
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  homeAccessibility: string[];
  specialRequirements: string | null;
  budget: CareBudget;
  caregiverPreferences: Omit<CaregiverPreferences, "gender"> & {
    gender: string | null;
  };
  updatedAt: string;
};

export type CarePreferencesEnvelope = {
  /** `false` until step 3 has been saved once. */
  completed: boolean;
  preferences: CarePreferences | null;
};

export const fetchCarePreferences =
  async (): Promise<CarePreferencesEnvelope> => {
    const headers = await requireClientAuthHeaders();

    try {
      const { data } = await httpClient.get<CarePreferencesEnvelope>(
        SEEKER_CARE_PREFERENCES_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ClientAuthApiError(
        getApiErrorMessage(error, "Could not load the care preferences."),
      );
    }
  };

export const saveCarePreferences = async (
  payload: CarePreferencesPayload,
): Promise<CarePreferencesEnvelope> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.put<CarePreferencesEnvelope>(
      SEEKER_CARE_PREFERENCES_PATH,
      payload,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not save the care preferences. Please try again.",
      ),
      getApiErrorCode(error) === "VALIDATION_ERROR"
        ? "VALIDATION_ERROR"
        : "UNKNOWN_ERROR",
    );
  }
};
