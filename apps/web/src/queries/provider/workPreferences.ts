import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import { ProviderAuthApiError } from "./errors";

export const PROVIDER_WORK_PREFERENCES_PATH =
  "/provider/work-preferences" as const;

/**
 * `HH:mm` window. Overnight windows set `endsNextDay` (e.g. 22:00 → 06:00).
 */
export type TimeWindow = { start: string; end: string; endsNextDay: boolean };

export type DayAvailabilityMode =
  | "all_day"
  | "available_windows"
  | "blocked_windows";

export type WorkingDay = {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  mode: DayAvailabilityMode;
  windows: TimeWindow[];
};

export type WorkType = "full_time" | "part_time" | "flexible";
export type AvailabilityStart = "immediate" | "specific_date";
export type VehicleType = "car" | "suv" | "minivan" | "van" | "truck" | "other";

/** Onboarding step 4 payload (money in cents, distance in miles). */
export type ProviderWorkPreferencesPayload = {
  workingDays: WorkingDay[];
  workType: WorkType;
  availabilityStart: AvailabilityStart;
  /** `YYYY-MM-DD`, required for `specific_date`. */
  availableFrom: string | null;
  acceptsHourly: boolean;
  acceptsFixedPrice: boolean;
  acceptsOneTimeJobs: boolean;
  acceptsDailyJobs: boolean;
  acceptsWeeklyJobs: boolean;
  acceptsMonthlyJobs: boolean;
  availableOvernight: boolean;
  availableLiveIn: boolean;
  availableEmergency: boolean;
  maxTravelDistanceMiles: number;
  offersTransportation: boolean;
  vehicleType: VehicleType | null;
  vehicleWheelchairAccessible: boolean | null;
  minWeeklyHours: number;
  maxWeeklyHours: number;
  preferredHourlyRateCents: number;
  minHourlyRateCents: number;
  matchingNotes: string | null;
};

export type ProviderWorkPreferences = ProviderWorkPreferencesPayload & {
  createdAt: string;
  updatedAt: string;
};

export type ProviderWorkPreferencesEnvelope = {
  /** `false` until step 4 has been saved at least once. */
  completed: boolean;
  preferences: ProviderWorkPreferences | null;
};

const requireAuthHeaders = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ProviderAuthApiError(
      "Your session expired. Please sign in again.",
    );
  }

  return { Authorization: `Bearer ${accessToken}` };
};

export const fetchProviderWorkPreferences =
  async (): Promise<ProviderWorkPreferencesEnvelope> => {
    const headers = await requireAuthHeaders();

    try {
      const { data } = await httpClient.get<ProviderWorkPreferencesEnvelope>(
        PROVIDER_WORK_PREFERENCES_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ProviderAuthApiError(
        getApiErrorMessage(error, "Could not load your availability."),
      );
    }
  };

export const saveProviderWorkPreferences = async (
  payload: ProviderWorkPreferencesPayload,
): Promise<ProviderWorkPreferencesEnvelope> => {
  const headers = await requireAuthHeaders();

  try {
    const { data } = await httpClient.put<ProviderWorkPreferencesEnvelope>(
      PROVIDER_WORK_PREFERENCES_PATH,
      payload,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ProviderAuthApiError(
      getApiErrorMessage(
        error,
        "Could not save your availability and work preferences. Please try again.",
      ),
      getApiErrorCode(error) === "VALIDATION_ERROR"
        ? "VALIDATION_ERROR"
        : "UNKNOWN_ERROR",
    );
  }
};
