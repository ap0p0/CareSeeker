import dayjs from "dayjs";
import type {
  ProviderDocumentCategory,
  ProviderWorkPreferences,
  WorkingDay,
} from "../../../../queries/provider";
import { DOCUMENT_CATEGORY_OPTIONS } from "../Register/documentOptions";
import {
  CARE_SERVICE_OPTIONS,
  CARE_SKILL_OPTIONS,
  CARE_TASK_OPTIONS,
  CLIENT_GROUP_OPTIONS,
  LANGUAGE_OPTIONS,
  QUALIFICATION_OPTIONS,
} from "../../../../utils/careOptions";
import { PROVIDER_GENDER_OPTIONS } from "../Register/types";
import {
  formatCents,
  formatTimeWindow,
  labelFor,
  labelsFor,
} from "../../../../utils/formatters";
import { US_STATE_OPTIONS } from "../../../../utils/usStates";

/** Shared formatters, re-exported for the provider pages. */
export { formatCents, formatTimeWindow };
import {
  AVAILABILITY_START_OPTIONS,
  DAY_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  WORK_TYPE_OPTIONS,
} from "../Register/workPreferenceOptions";

/** Human labels for the option values stored by the API. */

export const careServiceLabels = (values: string[], other?: string | null) =>
  labelsFor(CARE_SERVICE_OPTIONS, values, other);
export const skillLabels = (values: string[], other?: string | null) =>
  labelsFor(CARE_SKILL_OPTIONS, values, other);
export const qualificationLabels = (values: string[], other?: string | null) =>
  labelsFor(QUALIFICATION_OPTIONS, values, other);
export const languageLabels = (values: string[], other?: string | null) =>
  labelsFor(LANGUAGE_OPTIONS, values, other);
export const taskLabels = (values: string[]) =>
  labelsFor(CARE_TASK_OPTIONS, values);
export const clientGroupLabels = (values: string[]) =>
  labelsFor(CLIENT_GROUP_OPTIONS, values);
export const workTypeLabel = (value: string) =>
  labelFor(WORK_TYPE_OPTIONS, value) ?? value;
export const availabilityStartLabel = (value: string) =>
  labelFor(AVAILABILITY_START_OPTIONS, value) ?? value;
export const vehicleTypeLabel = (value: string | null) =>
  value ? (labelFor(VEHICLE_TYPE_OPTIONS, value) ?? value) : null;
export const genderLabel = (value: string | null) =>
  value ? (labelFor(PROVIDER_GENDER_OPTIONS, value) ?? value) : null;
export const stateLabel = (code: string) =>
  US_STATE_OPTIONS.find((option) => option.value === code)?.label ?? code;
export const documentCategoryLabel = (category: ProviderDocumentCategory) =>
  DOCUMENT_CATEGORY_OPTIONS.find((option) => option.value === category)
    ?.label ?? category;

/** Main service category shown as the provider's "title". */
export const professionalTitle = (
  careServices: string[],
  otherCareService: string | null,
): string | null => {
  const [first] = careServices;
  if (!first) return null;
  const label =
    first === "other" && otherCareService
      ? otherCareService
      : labelFor(CARE_SERVICE_OPTIONS, first);
  return label ? `${label} provider` : null;
};

export const formatDaySchedule = (day: WorkingDay): string => {
  if (day.mode === "all_day") return "All day";
  const windows = day.windows.map(formatTimeWindow).join(", ");
  return day.mode === "blocked_windows" ? `Except ${windows}` : windows;
};

/** Mon → Sun order, with "Not available" for missing days. */
export const weeklyScheduleRows = (
  workingDays: WorkingDay[],
): { day: string; summary: string; available: boolean }[] =>
  DAY_OPTIONS.map((option) => {
    const day = workingDays.find((item) => item.dayOfWeek === option.value);
    return {
      day: option.label,
      summary: day ? formatDaySchedule(day) : "Not available",
      available: Boolean(day),
    };
  });

/** One-line availability summary, e.g. for the dashboard widget. */
export const availabilitySummaryLine = (
  preferences: ProviderWorkPreferences | null,
): string => {
  if (!preferences) return "Availability not set yet.";
  const days = DAY_OPTIONS.filter((option) =>
    preferences.workingDays.some((day) => day.dayOfWeek === option.value),
  ).map((option) => option.short);
  const extras = [
    preferences.availableOvernight ? "overnight" : null,
    preferences.availableLiveIn ? "live-in" : null,
    preferences.availableEmergency ? "short notice" : null,
  ].filter(Boolean);
  return `${workTypeLabel(preferences.workType)} · ${days.join(", ")}${
    extras.length ? ` · ${extras.join(", ")}` : ""
  }`;
};

export const jobFrequencyLabels = (
  preferences: ProviderWorkPreferences,
): string[] =>
  [
    preferences.acceptsOneTimeJobs ? "One-time jobs" : null,
    preferences.acceptsDailyJobs ? "Daily" : null,
    preferences.acceptsWeeklyJobs ? "Weekly" : null,
    preferences.acceptsMonthlyJobs ? "Monthly" : null,
  ].filter((item): item is string => item !== null);

export const paymentModelLabels = (
  preferences: ProviderWorkPreferences,
): string[] =>
  [
    preferences.acceptsHourly ? "Hourly" : null,
    preferences.acceptsFixedPrice ? "Fixed price per job" : null,
  ].filter((item): item is string => item !== null);

export const formatDate = (value: string | null): string | null =>
  value ? dayjs(value).format("MMM D, YYYY") : null;
