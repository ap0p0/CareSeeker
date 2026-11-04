import { ProviderGender } from '../../../generated/prisma/client.js';
import { isUsStateCode } from './us-states';

/**
 * Field-level parsers for provider personal information (onboarding step 1).
 *
 * Each parser reads one raw value, pushes a human-readable message into
 * `errors` when invalid, and returns the normalized value (or `null` when the
 * field is invalid / missing). They are shared by registration and by the
 * authenticated profile update so both paths enforce identical rules.
 */

export const MIN_PROVIDER_AGE = 18;
export const MAX_PROVIDER_AGE = 120;

const NAME_MAX_LENGTH = 100;
const ADDRESS_LINE_MAX_LENGTH = 200;
const CITY_MAX_LENGTH = 100;

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
/** US number: 10 national digits, optionally prefixed with the country code 1. */
const US_PHONE_REGEX = /^\+?1?([2-9][0-9]{9})$/;
/** US ZIP or ZIP+4. */
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

const PROVIDER_GENDERS = new Set<string>(Object.values(ProviderGender));

/** US-only address: `state` is the USPS code, `postalCode` the ZIP. */
export type ProviderAddress = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseRequiredText(
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

/**
 * Accepts `YYYY-MM-DD`, returns a UTC midnight `Date`. Providers must be at
 * least 18 years old.
 */
export function parseDateOfBirth(
  value: unknown,
  errors: string[],
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

  const age = calculateAge(date, today);
  if (age < MIN_PROVIDER_AGE) {
    errors.push(
      `dateOfBirth must be at least ${MIN_PROVIDER_AGE} years before today`,
    );
    return null;
  }

  if (age > MAX_PROVIDER_AGE) {
    errors.push('dateOfBirth is not a plausible date of birth');
    return null;
  }

  return date;
}

/**
 * Optional. Empty / null clears the value; otherwise must match `ProviderGender`.
 */
export function parseGender(
  value: unknown,
  errors: string[],
): ProviderGender | null {
  if (typeof value === 'undefined' || value === null) return null;
  if (typeof value !== 'string') {
    errors.push('gender must be a string');
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;

  if (!PROVIDER_GENDERS.has(normalized)) {
    errors.push(
      `gender must be one of: ${Object.values(ProviderGender)
        .map((item) => item.toLowerCase())
        .join(', ')}`,
    );
    return null;
  }

  return normalized as ProviderGender;
}

/**
 * Normalizes a US phone number to E.164 (`+1XXXXXXXXXX`). Accepts common
 * formatting — `(555) 123-4567`, `555.123.4567`, `+1 555 123 4567`,
 * `1-555-123-4567`. Returns `null` when it is not a valid US number.
 */
export function normalizeUsPhone(value: string): string | null {
  const digits = value.trim().replace(/[\s().-]/g, '');
  const match = US_PHONE_REGEX.exec(digits);
  return match ? `+1${match[1]}` : null;
}

export function parsePhone(value: unknown, errors: string[]): string | null {
  const text = readString(value);
  if (!text) {
    errors.push('phone is required');
    return null;
  }

  const normalized = normalizeUsPhone(text);
  if (!normalized) {
    errors.push('phone must be a valid US phone number (10 digits)');
    return null;
  }

  return normalized;
}

/**
 * US-only structured address. Every part is required; `state` must be a USPS
 * code (stored upper-cased) and `postalCode` a ZIP or ZIP+4.
 */
export function parseAddress(
  body: Record<string, unknown>,
  errors: string[],
): ProviderAddress | null {
  const addressLine1 = parseRequiredText(
    body.addressLine1,
    'addressLine1',
    ADDRESS_LINE_MAX_LENGTH,
    errors,
  );
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

  if (!addressLine1 || !city || !state || !postalCode) {
    return null;
  }

  return { addressLine1, city, state, postalCode };
}

export function hasOwn(body: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, field);
}
