import type {
  AvailabilityStart,
  VehicleType,
  WorkType,
} from '../../../generated/prisma/client.js';

import type {
  ScheduleDayInput,
  TimeWindow,
} from '../../common/weekly-schedule.validation';

export type { TimeWindow };

/**
 * AVAILABLE windows for AVAILABLE_WINDOWS, BLOCKED windows for
 * BLOCKED_WINDOWS, empty for ALL_DAY.
 */
export type WorkingDayInput = ScheduleDayInput;

/** Validated / normalized onboarding step 4 payload. */
export type ProviderWorkPreferencesInput = {
  workingDays: WorkingDayInput[];
  workType: WorkType;
  availabilityStart: AvailabilityStart;
  availableFrom: Date | null;
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

/** API representation (enum values lower-cased, dates as `YYYY-MM-DD`). */
export type ProviderWorkPreferencesResponse = Omit<
  ProviderWorkPreferencesInput,
  | 'workingDays'
  | 'workType'
  | 'availabilityStart'
  | 'availableFrom'
  | 'vehicleType'
> & {
  workingDays: { dayOfWeek: number; mode: string; windows: TimeWindow[] }[];
  workType: string;
  availabilityStart: string;
  availableFrom: string | null;
  vehicleType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProviderWorkPreferencesEnvelope = {
  /** `false` until step 4 has been saved at least once. */
  completed: boolean;
  preferences: ProviderWorkPreferencesResponse | null;
};
