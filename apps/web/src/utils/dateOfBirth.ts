import dayjs, { type Dayjs } from "dayjs";

/** Wire format for dates of birth (`YYYY-MM-DD`). */
export const DATE_OF_BIRTH_FORMAT = "YYYY-MM-DD";

export type DateOfBirthRules = {
  /** Minimum age in full years (0 allows babies). */
  minAge: number;
  /** Older dates are rejected as implausible. */
  maxAge: number;
};

/**
 * Latest / earliest selectable dates of birth, used for the picker bounds and
 * for validation. Compared at day precision.
 */
export const getDateOfBirthBounds = (
  rules: DateOfBirthRules,
  today: Dayjs = dayjs(),
) => ({
  max: today.startOf("day").subtract(rules.minAge, "year"),
  min: today.startOf("day").subtract(rules.maxAge, "year"),
});

/**
 * Mirrors the API rules (`parseDateOfBirth`): a real date, not in the future,
 * within `rules`. `tooYoungMessage` explains the minimum age when there is one.
 */
export const validateDateOfBirth = (
  value: Dayjs | null,
  rules: DateOfBirthRules,
  messages: { missing: string; tooYoung?: string },
  today: Dayjs = dayjs(),
): string | undefined => {
  if (!value) {
    return messages.missing;
  }

  if (!value.isValid()) {
    return "Please enter a valid date.";
  }

  const { max, min } = getDateOfBirthBounds(rules, today);

  if (value.isAfter(today, "day")) {
    return "The date of birth cannot be in the future.";
  }

  if (value.isAfter(max, "day")) {
    return messages.tooYoung ?? "Please enter a valid date of birth.";
  }

  if (value.isBefore(min, "day")) {
    return "Please enter a valid date of birth.";
  }

  return undefined;
};
