import { Gender } from '../../generated/prisma/client.js';
import { isUsStateCode } from './us-states';

/**
 * Field-level parsers for personal information shared by every registration
 * flow (provider onboarding, care recipients registered by a seeker, …).
 *
 * Each parser reads one raw value, pushes a human-readable message into
 * `errors` when invalid, and returns the normalized value (or `null` when the
 * field is invalid / missing).
 */

export const NAME_MAX_LENGTH = 100;
export const ADDRESS_LINE_MAX_LENGTH = 200;
export const CITY_MAX_LENGTH = 100;

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
/** US ZIP or ZIP+4. */
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

const GENDERS = new Set<string>(Object.values(Gender));

/** US-only address: `state` is the USPS code, `postalCode` the ZIP. */
export type UsAddress = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
};

export function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseRequiredText(
  value: unknown,
  field: string,
  maxLength: number,
  errors: string[],
): string | null {
  const text = readString(value);
  if (!text) {
    errors.push(`${field} is required`);
    return null;
  }

  if (text.length > maxLength) {
    errors.push(`${field} must be at most ${maxLength} characters`);
    return null;
  }

  return text;
}

export function parseName(
  value: unknown,
  field: 'name' | 'surname',
  errors: string[],
): string | null {
  return parseRequiredText(value, field, NAME_MAX_LENGTH, errors);
}

/**
 * Full years between `dateOfBirth` and `today`, both treated as UTC calendar days.
 */
export function calculateAge(dateOfBirth: Date, today = new Date()): number {
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())
  ) {
    age -= 1;
  }

  return age;
}

export type DateOfBirthRules = {
  /** Minimum age in full years (0 allows babies). */
  minAge: number;
  /** Anything older is rejected as implausible. */
  maxAge: number;
};

/**
 * Accepts `YYYY-MM-DD`, returns a UTC midnight `Date`. Rejects future dates
 * and ages outside `rules`.
 */
export function parseDateOfBirth(
  value: unknown,
  errors: string[],
  rules: DateOfBirthRules,
  today = new Date(),
): Date | null {
  const text = readString(value);
  if (!text) {
    errors.push('dateOfBirth is required');
    return null;
  }

  const match = ISO_DATE_REGEX.exec(text);
  if (!match) {
    errors.push('dateOfBirth must be a date in YYYY-MM-DD format');
    return null;
  }

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealCalendarDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!isRealCalendarDate) {
    errors.push('dateOfBirth must be a valid calendar date');
    return null;
  }

  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  if (date.getTime() > todayUtc) {
    errors.push('dateOfBirth cannot be in the future');
    return null;
  }

  const age = calculateAge(date, today);
  if (age < rules.minAge) {
    errors.push(
      `dateOfBirth must be at least ${rules.minAge} years before today`,
    );
    return null;
  }

  if (age > rules.maxAge) {
    errors.push('dateOfBirth is not a plausible date of birth');
    return null;
  }

  return date;
}

/**
 * `Gender` value (case-insensitive). When `required` is false, empty / null
 * means "not specified" and returns `null` without an error.
 */
export function parseGender(
  value: unknown,
  errors: string[],
  options: { required: boolean } = { required: false },
): Gender | null {
  if (typeof value !== 'undefined' && value !== null) {
    if (typeof value !== 'string') {
      errors.push('gender must be a string');
      return null;
    }
  }

  const normalized = readString(value).toUpperCase();
  if (!normalized) {
    if (options.required) errors.push('gender is required');
    return null;
  }

  if (!GENDERS.has(normalized)) {
    errors.push(
      `gender must be one of: ${Object.values(Gender)
        .map((item) => item.toLowerCase())
        .join(', ')}`,
    );
    return null;
  }

  return normalized as Gender;
}

/** City, USPS state code and ZIP — an address without the street. */
export type UsCityStateZip = Omit<UsAddress, 'addressLine1'>;

/**
 * City, state and ZIP of a US address. Every part is required; `state` must
 * be a USPS code (stored upper-cased) and `postalCode` a ZIP or ZIP+4. Used
 * on its own where the street must not be stored (job posts).
 */
export function parseCityStateZip(
  body: Record<string, unknown>,
  errors: string[],
): UsCityStateZip | null {
  const city = parseRequiredText(body.city, 'city', CITY_MAX_LENGTH, errors);

  const stateRaw = readString(body.state).toUpperCase();
  let state: string | null = null;
  if (!stateRaw) {
    errors.push('state is required');
  } else if (!isUsStateCode(stateRaw)) {
    errors.push('state must be a valid US state code (e.g. TX)');
  } else {
    state = stateRaw;
  }

  const postalCodeRaw = readString(body.postalCode);
  let postalCode: string | null = null;
  if (!postalCodeRaw) {
    errors.push('postalCode is required');
  } else if (!US_ZIP_REGEX.test(postalCodeRaw)) {
    errors.push('postalCode must be a US ZIP code (12345 or 12345-6789)');
  } else {
    postalCode = postalCodeRaw;
  }

  if (!city || !state || !postalCode) {
    return null;
  }

  return { city, state, postalCode };
}

/**
 * US-only structured address. Every part is required; `state` must be a USPS
 * code (stored upper-cased) and `postalCode` a ZIP or ZIP+4.
 */
export function parseAddress(
  body: Record<string, unknown>,
  errors: string[],
): UsAddress | null {
  const addressLine1 = parseRequiredText(
    body.addressLine1,
    'addressLine1',
    ADDRESS_LINE_MAX_LENGTH,
    errors,
  );
  const cityStateZip = parseCityStateZip(body, errors);

  if (!addressLine1 || !cityStateZip) {
    return null;
  }

  return { addressLine1, ...cityStateZip };
}

export function hasOwn(body: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, field);
}

/** `Date` (UTC midnight, from a `DATE` column) → `YYYY-MM-DD`. */
export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
