import type {
  AvailabilityStart,
  DayAvailabilityMode,
  VehicleType,
  WorkType,
} from "../../../../queries/provider";
import type { Option } from "../../../../utils/careOptions";
import {
  DAY_OPTIONS,
  MAX_WINDOWS_PER_DAY,
  TIME_FORMAT,
} from "../../../../utils/weeklySchedule";

/** Schedule basics are shared with the seeker side (`utils/weeklySchedule`). */
export { DAY_OPTIONS, MAX_WINDOWS_PER_DAY, TIME_FORMAT };

export const DAY_MODE_OPTIONS: {
  value: DayAvailabilityMode;
  label: string;
  hint: string;
}[] = [
  { value: "all_day", label: "All day", hint: "Available any time this day." },
  {
    value: "available_windows",
    label: "Available hours",
    hint: "Only during the hours you add.",
  },
  {
    value: "blocked_windows",
    label: "Block hours",
    hint: "Available except during the hours you block.",
  },
];

export const WORK_TYPE_OPTIONS: Option<WorkType>[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "flexible", label: "Flexible" },
];

export const AVAILABILITY_START_OPTIONS: Option<AvailabilityStart>[] = [
  { value: "immediate", label: "I can start immediately" },
  { value: "specific_date", label: "I can start from a specific date" },
];

export const VEHICLE_TYPE_OPTIONS: Option<VehicleType>[] = [
  { value: "car", label: "Car" },
  { value: "suv", label: "SUV" },
  { value: "minivan", label: "Minivan" },
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
  { value: "other", label: "Other" },
];

export const MAX_TRAVEL_DISTANCE_MILES = 100;
export const MAX_WEEKLY_HOURS = 168;
export const MAX_HOURLY_RATE = 500;
export const MATCHING_NOTES_MAX_LENGTH = 1000;
