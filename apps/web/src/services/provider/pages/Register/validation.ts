import dayjs, { type Dayjs } from "dayjs";
import type {
  ProviderPersonalInfoErrors,
  ProviderPersonalInfoForm,
  ProviderServicesJobsErrors,
  ProviderServicesJobsForm,
  ProviderWorkPreferencesErrors,
  ProviderWorkPreferencesForm,
  TimeWindowForm,
} from "./types";
import { isUsStateCode } from "./usStates";
import {
  MATCHING_NOTES_MAX_LENGTH,
  MAX_HOURLY_RATE,
  MAX_TRAVEL_DISTANCE_MILES,
  MAX_WEEKLY_HOURS,
  MAX_WINDOWS_PER_DAY,
} from "./workPreferenceOptions";

/** Mirrors the API rules so users get instant feedback before submitting. */
export const MIN_PROVIDER_AGE = 18;
export const MAX_PROVIDER_AGE = 120;
export const PASSWORD_MIN_LENGTH = 6;
export const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_PICTURE_ACCEPT = "image/jpeg,image/png,image/webp";
export const DATE_OF_BIRTH_FORMAT = "YYYY-MM-DD";

const PROFILE_PICTURE_MIME_TYPES = new Set(PROFILE_PICTURE_ACCEPT.split(","));
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** US number: 10 national digits, optionally prefixed with the country code 1. */
const US_PHONE_REGEX = /^\+?1?([2-9][0-9]{9})$/;
/** US ZIP or ZIP+4. */
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

/**
 * Latest / earliest selectable dates of birth, used for the picker bounds and
 * for validation. Compared at day precision.
 */
export const getDateOfBirthBounds = (today: Dayjs = dayjs()) => ({
  max: today.startOf("day").subtract(MIN_PROVIDER_AGE, "year"),
  min: today.startOf("day").subtract(MAX_PROVIDER_AGE, "year"),
});

/** E.164 (`+1XXXXXXXXXX`) or `null` when not a valid US number. */
export const normalizeUsPhone = (value: string): string | null => {
  const digits = value.trim().replace(/[\s().-]/g, "");
  const match = US_PHONE_REGEX.exec(digits);
  return match ? `+1${match[1]}` : null;
};

const requiredText = (value: string, message: string): string | undefined =>
  value.trim().length === 0 ? message : undefined;

export const validateDateOfBirth = (
  value: Dayjs | null,
  today: Dayjs = dayjs(),
): string | undefined => {
  if (!value) {
    return "Please enter your date of birth.";
  }

  if (!value.isValid()) {
    return "Please enter a valid date.";
  }

  const { max, min } = getDateOfBirthBounds(today);

  if (value.isAfter(max, "day")) {
    return `You must be at least ${MIN_PROVIDER_AGE} years old to register.`;
  }

  if (value.isBefore(min, "day")) {
    return "Please enter a valid date of birth.";
  }

  return undefined;
};

export const validateProfilePicture = (
  file: File | null,
): string | undefined => {
  if (!file) {
    return "Please add a profile picture.";
  }

  if (!PROFILE_PICTURE_MIME_TYPES.has(file.type)) {
    return "Profile picture must be a JPEG, PNG or WebP image.";
  }

  if (file.size > PROFILE_PICTURE_MAX_BYTES) {
    return `Profile picture must be ${PROFILE_PICTURE_MAX_BYTES / (1024 * 1024)} MB or smaller.`;
  }

  return undefined;
};

/**
 * Returns one message per invalid field (empty object when the form is valid).
 */
export type PersonalInfoValidationMode = "register" | "edit";

/**
 * In `edit` mode (account settings) the account fields are not part of the
 * form and the picture is optional (the stored one is kept).
 */
export const validateProviderPersonalInfo = (
  form: ProviderPersonalInfoForm,
  today: Dayjs = dayjs(),
  mode: PersonalInfoValidationMode = "register",
): ProviderPersonalInfoErrors => {
  const errors: ProviderPersonalInfoErrors = {};
  const editing = mode === "edit";

  const name = requiredText(form.name, "Please enter your first name.");
  if (name) errors.name = name;

  const surname = requiredText(form.surname, "Please enter your last name.");
  if (surname) errors.surname = surname;

  const dateOfBirth = validateDateOfBirth(form.dateOfBirth, today);
  if (dateOfBirth) errors.dateOfBirth = dateOfBirth;

  if (!editing) {
    if (!form.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

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
  }

  if (!form.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!normalizeUsPhone(form.phone)) {
    errors.phone = "Please enter a valid US phone number (10 digits).";
  }

  const addressLine1 = requiredText(
    form.addressLine1,
    "Please enter your street address.",
  );
  if (addressLine1) errors.addressLine1 = addressLine1;

  const city = requiredText(form.city, "Please enter your city.");
  if (city) errors.city = city;

  if (!form.state) {
    errors.state = "Please select your state.";
  } else if (!isUsStateCode(form.state)) {
    errors.state = "Please select a valid state.";
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = "Please enter your ZIP code.";
  } else if (!US_ZIP_REGEX.test(form.postalCode.trim())) {
    errors.postalCode = "Please enter a valid ZIP code (12345 or 12345-6789).";
  }

  if (!editing || form.profilePicture) {
    const profilePicture = validateProfilePicture(form.profilePicture);
    if (profilePicture) errors.profilePicture = profilePicture;
  }

  return errors;
};

// ─── Step 2: services & job interests ────────────────────────────────────────

export const YEARS_OF_EXPERIENCE_MAX = 60;
export const OTHER_TEXT_MAX_LENGTH = 100;
export const PREVIOUS_EXPERIENCE_MAX_LENGTH = 2000;
export const COVER_LETTER_MIN_LENGTH = 20;
export const COVER_LETTER_MAX_LENGTH = 1000;

const validateOtherText = (
  selected: boolean,
  value: string,
  what: string,
): string | undefined => {
  if (!selected) return undefined;
  if (!value.trim()) return `Please specify the other ${what}.`;
  if (value.trim().length > OTHER_TEXT_MAX_LENGTH) {
    return `Please keep it under ${OTHER_TEXT_MAX_LENGTH} characters.`;
  }
  return undefined;
};

/**
 * Returns one message per invalid field (empty object when the form is valid).
 * Mirrors the API rules for `PUT /provider/service-profile`.
 */
export const validateProviderServicesJobs = (
  form: ProviderServicesJobsForm,
): ProviderServicesJobsErrors => {
  const errors: ProviderServicesJobsErrors = {};

  if (form.careServices.length === 0) {
    errors.careServices = "Please select at least one care service you offer.";
  }
  const otherCareService = validateOtherText(
    form.careServices.includes("other"),
    form.otherCareService,
    "care service",
  );
  if (otherCareService) errors.otherCareService = otherCareService;

  if (form.skills.length === 0) {
    errors.skills = "Please select at least one relevant skill.";
  }
  const otherSkill = validateOtherText(
    form.skills.includes("other"),
    form.otherSkill,
    "skill",
  );
  if (otherSkill) errors.otherSkill = otherSkill;

  const years = form.yearsOfExperience.trim();
  const yearsNumber = years === "" ? NaN : Number(years);
  if (years === "") {
    errors.yearsOfExperience = "Please enter your years of experience.";
  } else if (
    !Number.isInteger(yearsNumber) ||
    yearsNumber < 0 ||
    yearsNumber > YEARS_OF_EXPERIENCE_MAX
  ) {
    errors.yearsOfExperience = `Enter a whole number between 0 and ${YEARS_OF_EXPERIENCE_MAX}.`;
  }

  if (!form.previousCareExperience.trim()) {
    errors.previousCareExperience =
      "Please describe your previous care experience (informal experience counts too).";
  } else if (
    form.previousCareExperience.trim().length > PREVIOUS_EXPERIENCE_MAX_LENGTH
  ) {
    errors.previousCareExperience = `Please keep it under ${PREVIOUS_EXPERIENCE_MAX_LENGTH} characters.`;
  }

  const otherQualification = validateOtherText(
    form.qualifications.includes("other"),
    form.otherQualification,
    "qualification",
  );
  if (otherQualification) errors.otherQualification = otherQualification;

  if (form.languages.length === 0) {
    errors.languages = "Please select at least one language you speak.";
  }
  const otherLanguage = validateOtherText(
    form.languages.includes("other"),
    form.otherLanguage,
    "language",
  );
  if (otherLanguage) errors.otherLanguage = otherLanguage;

  const coverLetter = form.coverLetter.trim();
  if (!coverLetter) {
    errors.coverLetter = "Please write a few sentences about yourself.";
  } else if (coverLetter.length < COVER_LETTER_MIN_LENGTH) {
    errors.coverLetter = `Please write at least ${COVER_LETTER_MIN_LENGTH} characters.`;
  } else if (coverLetter.length > COVER_LETTER_MAX_LENGTH) {
    errors.coverLetter = `Please keep it under ${COVER_LETTER_MAX_LENGTH} characters.`;
  }

  if (form.jobCategories.length === 0) {
    errors.jobCategories =
      "Please select at least one care category you want to work in.";
  }

  if (form.tasksWilling.length === 0) {
    errors.tasksWilling =
      "Please select at least one task you are willing to perform.";
  }
  const overlap = form.tasksUnwilling.filter((task) =>
    form.tasksWilling.includes(task),
  );
  if (overlap.length > 0) {
    errors.tasksUnwilling =
      "A task cannot be both willing and unwilling. Please review your selection.";
  }

  if (form.clientGroups.length === 0) {
    errors.clientGroups =
      "Please select at least one group you prefer to work with.";
  }

  return errors;
};

// ─── Step 4: availability & work preferences ─────────────────────────────────

/** Dollars (up to 2 decimals) → cents, or `null` when not a valid amount. */
export const dollarsToCents = (value: string): number | null => {
  const text = value.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  return Math.round(Number(text) * 100);
};

const validateWindows = (windows: TimeWindowForm[]): string | undefined => {
  if (windows.length === 0) return "Add at least one time window.";
  if (windows.length > MAX_WINDOWS_PER_DAY) {
    return `Use at most ${MAX_WINDOWS_PER_DAY} time windows per day.`;
  }

  const parsed: { start: number; end: number }[] = [];
  for (const window of windows) {
    if (!window.start?.isValid() || !window.end?.isValid()) {
      return "Each time window needs a valid start and end time.";
    }
    const start = window.start.hour() * 60 + window.start.minute();
    const sameDayEnd = window.end.hour() * 60 + window.end.minute();
    if (!window.endsNextDay && start >= sameDayEnd) {
      return "A time window must end after it starts — turn on “Ends next day” for overnight hours.";
    }
    if (window.endsNextDay && sameDayEnd > start) {
      return "An overnight window cannot be longer than 24 hours.";
    }
    // Overnight ends are counted past midnight so overlap checks still work.
    parsed.push({
      start,
      end: sameDayEnd + (window.endsNextDay ? 24 * 60 : 0),
    });
  }

  parsed.sort((a, b) => a.start - b.start);
  for (let i = 1; i < parsed.length; i += 1) {
    if (parsed[i].start < parsed[i - 1].end) {
      return "Time windows must not overlap.";
    }
  }

  return undefined;
};

const wholeNumber = (
  value: string,
  min: number,
  max: number,
): number | null => {
  const number = value.trim() === "" ? NaN : Number(value);
  return Number.isInteger(number) && number >= min && number <= max
    ? number
    : null;
};

/**
 * Returns one message per invalid field (`day-<n>` for a day's schedule).
 * Mirrors the API rules for `PUT /provider/work-preferences`.
 */
export const validateProviderWorkPreferences = (
  form: ProviderWorkPreferencesForm,
  today: Dayjs = dayjs(),
): ProviderWorkPreferencesErrors => {
  const errors: ProviderWorkPreferencesErrors = {};

  const enabledDays = Object.entries(form.days).filter(
    ([, day]) => day.enabled,
  );
  if (enabledDays.length === 0) {
    errors.days = "Select at least one day you are available to work.";
  }
  for (const [day, schedule] of enabledDays) {
    if (schedule.mode === "all_day") continue;
    const windowError = validateWindows(schedule.windows);
    if (windowError) errors[`day-${day}`] = windowError;
  }

  if (!form.workType) {
    errors.workType = "Please choose how much you want to work.";
  }

  if (form.availabilityStart === "specific_date") {
    if (!form.availableFrom?.isValid()) {
      errors.availableFrom = "Please pick the date you can start.";
    } else if (form.availableFrom.isBefore(today, "day")) {
      errors.availableFrom = "The start date cannot be in the past.";
    }
  }

  if (!form.acceptsHourly && !form.acceptsFixedPrice) {
    errors.compensation = "Select at least one way you want to be paid.";
  }

  if (
    !form.acceptsOneTimeJobs &&
    !form.acceptsDailyJobs &&
    !form.acceptsWeeklyJobs &&
    !form.acceptsMonthlyJobs
  ) {
    errors.jobFrequency = "Select at least one type of job you accept.";
  }

  if (
    !Number.isInteger(form.maxTravelDistanceMiles) ||
    form.maxTravelDistanceMiles < 1 ||
    form.maxTravelDistanceMiles > MAX_TRAVEL_DISTANCE_MILES
  ) {
    errors.maxTravelDistanceMiles = `Choose a distance between 1 and ${MAX_TRAVEL_DISTANCE_MILES} miles.`;
  }

  if (form.offersTransportation && !form.vehicleType) {
    errors.vehicleType = "Please tell us what kind of vehicle you own.";
  }

  const minHours = wholeNumber(form.minWeeklyHours, 1, MAX_WEEKLY_HOURS);
  const maxHours = wholeNumber(form.maxWeeklyHours, 1, MAX_WEEKLY_HOURS);
  if (minHours === null) {
    errors.minWeeklyHours = `Enter a whole number between 1 and ${MAX_WEEKLY_HOURS}.`;
  }
  if (maxHours === null) {
    errors.maxWeeklyHours = `Enter a whole number between 1 and ${MAX_WEEKLY_HOURS}.`;
  } else if (minHours !== null && minHours > maxHours) {
    errors.maxWeeklyHours = "Maximum hours must be at least the minimum.";
  }

  const preferredCents = dollarsToCents(form.preferredHourlyRate);
  const minCents = dollarsToCents(form.minHourlyRate);
  if (
    preferredCents === null ||
    preferredCents < 1 ||
    preferredCents > MAX_HOURLY_RATE * 100
  ) {
    errors.preferredHourlyRate = `Enter an amount between $0.01 and $${MAX_HOURLY_RATE}.`;
  }
  if (minCents === null || minCents < 1 || minCents > MAX_HOURLY_RATE * 100) {
    errors.minHourlyRate = `Enter an amount between $0.01 and $${MAX_HOURLY_RATE}.`;
  } else if (preferredCents !== null && minCents > preferredCents) {
    errors.minHourlyRate =
      "Your minimum cannot be higher than your preferred rate.";
  }

  if (form.matchingNotes.trim().length > MATCHING_NOTES_MAX_LENGTH) {
    errors.matchingNotes = `Please keep it under ${MATCHING_NOTES_MAX_LENGTH} characters.`;
  }

  return errors;
};
