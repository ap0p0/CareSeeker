import type { CarePreferences } from "../../../../queries/client";
import {
  CARE_TASK_OPTIONS,
  LANGUAGE_OPTIONS,
  QUALIFICATION_OPTIONS,
} from "../../../../utils/careOptions";
import {
  formatCents,
  formatLongDate,
  formatTimeWindow,
  labelFor,
  labelsFor,
} from "../../../../utils/formatters";
import { GENDER_OPTIONS } from "../../../../utils/gender";
import { US_STATE_OPTIONS } from "../../../../utils/usStates";
import { DAY_OPTIONS } from "../../../../utils/weeklySchedule";
import {
  CARE_DURATION_OPTIONS,
  CARE_FREQUENCY_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  budgetUnit,
} from "../Register/carePreferencesForm";
import {
  CARE_URGENCY_OPTIONS,
  ETHNIC_BACKGROUND_OPTIONS,
  HOME_ACCESSIBILITY_OPTIONS,
  LIVING_SITUATION_OPTIONS,
  MOBILITY_LEVEL_OPTIONS,
  PREFERRED_CAREGIVER_GENDER_OPTIONS,
  REGISTRANT_RELATIONSHIP_OPTIONS,
  SPOKEN_LANGUAGE_OPTIONS,
} from "../Register/types";

/** Human labels for the option values stored by the API (review page). */

export { formatCents, formatLongDate };

export const relationshipLabel = (value: string, other: string | null) =>
  value === "other" && other
    ? `Other: ${other}`
    : (labelFor(REGISTRANT_RELATIONSHIP_OPTIONS, value) ?? value);
export const genderLabel = (value: string | null) =>
  value ? (labelFor(GENDER_OPTIONS, value) ?? value) : null;
export const livingSituationLabel = (value: string | null) =>
  value ? (labelFor(LIVING_SITUATION_OPTIONS, value) ?? value) : null;
export const mobilityLabel = (value: string | null) =>
  value ? (labelFor(MOBILITY_LEVEL_OPTIONS, value) ?? value) : null;
export const ethnicBackgroundLabel = (value: string | null) =>
  value ? (labelFor(ETHNIC_BACKGROUND_OPTIONS, value) ?? value) : null;
export const spokenLanguageLabels = (values: string[], other: string | null) =>
  labelsFor(SPOKEN_LANGUAGE_OPTIONS, values, other);
export const stateLabel = (code: string) =>
  US_STATE_OPTIONS.find((option) => option.value === code)?.label ?? code;

export const taskLabels = (values: string[]) =>
  labelsFor(CARE_TASK_OPTIONS, values);
export const qualificationLabels = (values: string[]) =>
  labelsFor(QUALIFICATION_OPTIONS, values);
export const accessibilityLabels = (values: string[]) =>
  labelsFor(HOME_ACCESSIBILITY_OPTIONS, values);
export const frequencyLabel = (value: string) =>
  labelFor(CARE_FREQUENCY_OPTIONS, value) ?? value;
export const durationLabel = (value: string | null) =>
  value ? (labelFor(CARE_DURATION_OPTIONS, value) ?? value) : null;
export const urgencyLabel = (value: string | null) =>
  value ? (labelFor(CARE_URGENCY_OPTIONS, value) ?? value) : null;
export const caregiverGenderLabel = (value: string | null) =>
  value ? (labelFor(PREFERRED_CAREGIVER_GENDER_OPTIONS, value) ?? value) : null;
export const caregiverLanguageLabel = (value: string | null) =>
  value ? (labelFor(LANGUAGE_OPTIONS, value) ?? value) : "No preference";

/** e.g. "Up to $30 per hour", "Up to $90 for the whole visit", "Not set". */
export const budgetLabel = (preferences: CarePreferences): string => {
  const type = labelFor(PAYMENT_TYPE_OPTIONS, preferences.budget.paymentType);
  if (preferences.budget.amountCents === null)
    return `${type} (no amount given)`;
  return `Up to ${formatCents(preferences.budget.amountCents)} ${budgetUnit(
    preferences.budget.paymentType,
    preferences.careFrequency === "one_time",
  )}`;
};

/** Mon → Sun rows of the requested weekly schedule (days without care omitted). */
export const careScheduleRows = (
  preferences: CarePreferences,
): { day: string; summary: string }[] =>
  DAY_OPTIONS.flatMap((option) => {
    const day = preferences.recurring?.scheduleDays.find(
      (item) => item.dayOfWeek === option.value,
    );
    if (!day) return [];
    return [
      {
        day: option.label,
        summary:
          day.mode === "all_day"
            ? "All day"
            : day.windows.map(formatTimeWindow).join(", "),
      },
    ];
  });

/** Yes-flags of a saved step 3, as chips. */
export const careFlagLabels = (preferences: CarePreferences): string[] =>
  [
    preferences.scheduleFlexible ? "Flexible times" : null,
    preferences.needsOvernightCare ? "Overnight care" : null,
    preferences.recurring?.needsLiveInCare ? "Live-in care" : null,
    preferences.recurring?.needsEmergencyCover ? "Last-minute help" : null,
    preferences.requiresCaregiverVehicle
      ? preferences.requiresWheelchairAccessibleVehicle
        ? "Wheelchair-accessible car"
        : "Caregiver needs a car"
      : null,
    preferences.petsInHome ? "Pets in the home" : null,
  ].filter((item): item is string => item !== null);
