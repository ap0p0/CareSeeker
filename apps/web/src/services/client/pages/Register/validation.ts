import dayjs, { type Dayjs } from "dayjs";
import {
  validateDateOfBirth,
  type DateOfBirthRules,
} from "../../../../utils/dateOfBirth";
import { dollarsToCents } from "../../../../utils/money";
import { validateUsAddress } from "../../../../utils/usAddress";
import { normalizeUsPhone } from "../../../../utils/usPhone";
import { validateWeekSchedule } from "../../../../utils/weeklySchedule";
import {
  isOneTimeCare,
  isRecurringCare,
  type CarePreferencesErrors,
  type CarePreferencesForm,
} from "./carePreferencesForm";
import type {
  CareRecipientErrors,
  CareRecipientForm,
  RegistrantInfoErrors,
  RegistrantInfoForm,
} from "./types";

/** Mirrors the API rules so users get instant feedback before submitting. */
export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MAX_LENGTH = 100;
export const RELATIONSHIP_OTHER_MAX_LENGTH = 100;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredText = (
  value: string,
  emptyMessage: string,
  maxLength: number,
): string | undefined => {
  const text = value.trim();
  if (!text) return emptyMessage;
  if (text.length > maxLength) {
    return `Please keep it under ${maxLength} characters.`;
  }
  return undefined;
};

/**
 * Step 1 of registering on behalf of someone else (the registrant).
 * Returns one message per invalid field (empty object when valid). In `edit`
 * mode (the account already exists) credentials and consent are not part of
 * the form.
 */
export const validateRegistrantInfo = (
  form: RegistrantInfoForm,
  mode: "register" | "edit" = "register",
): RegistrantInfoErrors => {
  const errors: RegistrantInfoErrors = {};
  const editing = mode === "edit";

  const name = requiredText(
    form.name,
    "Please enter your first name.",
    NAME_MAX_LENGTH,
  );
  if (name) errors.name = name;

  const surname = requiredText(
    form.surname,
    "Please enter your last name.",
    NAME_MAX_LENGTH,
  );
  if (surname) errors.surname = surname;

  if (!editing) {
    if (!form.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
  }

  if (!form.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!normalizeUsPhone(form.phone)) {
    errors.phone = "Please enter a valid US phone number (10 digits).";
  }

  if (!form.relationship) {
    errors.relationship =
      "Please tell us how you are related to the person who needs care.";
  } else if (form.relationship === "other") {
    const other = requiredText(
      form.relationshipOther,
      "Please describe your relationship.",
      RELATIONSHIP_OTHER_MAX_LENGTH,
    );
    if (other) errors.relationshipOther = other;
  }

  if (editing) return errors;

  if (!form.password) {
    errors.password = "Please choose a password.";
  } else if (form.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!form.consentToActOnBehalf) {
    errors.consentToActOnBehalf =
      "Please confirm that you may arrange care on this person's behalf.";
  }

  return errors;
};

// ─── On-behalf step 2: the person receiving care ─────────────────────────────

/** Anyone can receive care, babies included. Mirrors the API. */
export const RECIPIENT_AGE_RULES: DateOfBirthRules = { minAge: 0, maxAge: 120 };
export const OTHER_LANGUAGE_MAX_LENGTH = 100;
export const ADDITIONAL_INFO_MAX_LENGTH = 2000;

/**
 * Returns one message per invalid field (empty object when valid). Mirrors
 * the API rules for `PUT /seeker/care-recipient`.
 */
export const validateCareRecipient = (
  form: CareRecipientForm,
  today: Dayjs = dayjs(),
): CareRecipientErrors => {
  const errors: CareRecipientErrors = {};

  const name = requiredText(
    form.name,
    "Please enter their first name.",
    NAME_MAX_LENGTH,
  );
  if (name) errors.name = name;

  const surname = requiredText(
    form.surname,
    "Please enter their last name.",
    NAME_MAX_LENGTH,
  );
  if (surname) errors.surname = surname;

  const dateOfBirth = validateDateOfBirth(
    form.dateOfBirth,
    RECIPIENT_AGE_RULES,
    { missing: "Please enter their date of birth." },
    today,
  );
  if (dateOfBirth) errors.dateOfBirth = dateOfBirth;

  if (!form.gender) {
    errors.gender = "Please select a gender (or “Prefer not to say”).";
  }

  Object.assign(errors, validateUsAddress(form, "their"));

  if (!form.livingSituation) {
    errors.livingSituation = "Please tell us who they live with.";
  }

  if (!form.mobilityLevel) {
    errors.mobilityLevel = "Please tell us how they get around.";
  }

  if (form.languagesSpoken.length === 0) {
    errors.languagesSpoken = "Please select at least one language they speak.";
  } else if (form.languagesSpoken.includes("other")) {
    const other = requiredText(
      form.otherLanguage,
      "Please tell us which other language they speak.",
      OTHER_LANGUAGE_MAX_LENGTH,
    );
    if (other) errors.otherLanguage = other;
  }

  if (!form.ethnicBackground) {
    errors.ethnicBackground =
      "Please select an ethnic background (or “Prefer not to say”).";
  }

  if (form.additionalInfo.trim().length > ADDITIONAL_INFO_MAX_LENGTH) {
    errors.additionalInfo = `Please keep it under ${ADDITIONAL_INFO_MAX_LENGTH} characters.`;
  }

  return errors;
};

// ─── On-behalf step 3: care needs & assistance preferences ───────────────────

export const MAX_HOURS_PER_WEEK = 168;
/** Same ceilings as the API: $500 / hour, $10,000 fixed. */
export const MAX_HOURLY_BUDGET = 500;
export const MAX_FIXED_BUDGET = 10_000;
export const VISIT_NOTES_MAX_LENGTH = 500;
export const MAX_VISIT_DAYS_AHEAD = 365;
export const SPECIAL_REQUIREMENTS_MAX_LENGTH = 1000;
export const CULTURAL_CONSIDERATIONS_MAX_LENGTH = 1000;

/**
 * Returns one message per invalid field (`days` / `day-<n>` for the
 * schedule). Mirrors the API rules for `PUT /seeker/care-preferences`:
 * one-time visits need a date, hours and a budget; recurring care needs
 * weekly hours, duration, start and at least one day.
 */
export const validateCarePreferences = (
  form: CarePreferencesForm,
  today: Dayjs = dayjs(),
): CarePreferencesErrors => {
  const errors: CarePreferencesErrors = {};
  const oneTime = isOneTimeCare(form);

  if (!form.careFrequency) {
    errors.careFrequency =
      "Please tell us if this is a one-time visit or ongoing care.";
  }

  if (form.careTasks.length === 0) {
    errors.careTasks = oneTime
      ? "Please select what the visit is about."
      : "Please select at least one thing a caregiver should help with.";
  }

  if (oneTime) {
    if (!form.visitDate) {
      errors.visitDate = "Please pick the day of the visit.";
    } else if (!form.visitDate.isValid()) {
      errors.visitDate = "Please enter a valid date.";
    } else if (form.visitDate.isBefore(today, "day")) {
      errors.visitDate = "The visit cannot be in the past.";
    } else if (
      form.visitDate.isAfter(today.add(MAX_VISIT_DAYS_AHEAD, "day"), "day")
    ) {
      errors.visitDate = "Please pick a date within the next year.";
    }

    if (!form.visitStart?.isValid()) {
      errors.visitStart = "Please enter a start time.";
    }
    if (!form.visitEnd?.isValid()) {
      errors.visitEnd = "Please enter an end time.";
    } else if (
      form.visitStart?.isValid() &&
      form.visitEnd.hour() * 60 + form.visitEnd.minute() <=
        form.visitStart.hour() * 60 + form.visitStart.minute()
    ) {
      errors.visitEnd = "The visit must end after it starts.";
    }

    if (form.visitNotes.trim().length > VISIT_NOTES_MAX_LENGTH) {
      errors.visitNotes = `Please keep it under ${VISIT_NOTES_MAX_LENGTH} characters.`;
    }
  }

  if (isRecurringCare(form)) {
    const hours =
      form.hoursPerWeek.trim() === "" ? NaN : Number(form.hoursPerWeek);
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS_PER_WEEK) {
      errors.hoursPerWeek = `Enter a whole number of hours between 1 and ${MAX_HOURS_PER_WEEK}.`;
    }

    if (!form.careDuration) {
      errors.careDuration = "Please tell us how long care will be needed.";
    }

    if (!form.careUrgency) {
      errors.careUrgency = "Please tell us when care should start.";
    }

    Object.assign(
      errors,
      validateWeekSchedule(
        form.schedule,
        "Select at least one day care is needed.",
      ),
    );
  }

  const maxBudget =
    form.paymentType === "fixed_price" ? MAX_FIXED_BUDGET : MAX_HOURLY_BUDGET;
  if (!form.budget.trim()) {
    if (oneTime) {
      errors.budget = "Please tell us how much you are willing to pay.";
    }
  } else {
    const cents = dollarsToCents(form.budget);
    if (cents === null || cents < 1 || cents > maxBudget * 100) {
      errors.budget = `Enter an amount between $0.01 and $${maxBudget.toLocaleString("en-US")}.`;
    }
  }

  if (
    form.specialRequirements.trim().length > SPECIAL_REQUIREMENTS_MAX_LENGTH
  ) {
    errors.specialRequirements = `Please keep it under ${SPECIAL_REQUIREMENTS_MAX_LENGTH} characters.`;
  }

  if (!form.preferredCaregiverGender) {
    errors.preferredCaregiverGender =
      "Please choose a caregiver gender (or “No preference”).";
  }

  if (
    form.culturalConsiderations.trim().length >
    CULTURAL_CONSIDERATIONS_MAX_LENGTH
  ) {
    errors.culturalConsiderations = `Please keep it under ${CULTURAL_CONSIDERATIONS_MAX_LENGTH} characters.`;
  }

  return errors;
};
