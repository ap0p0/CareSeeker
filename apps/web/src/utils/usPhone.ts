/**
 * US phone number rules shared by every registration form. Mirrors the API
 * (`apps/api/src/common/us-phone.ts`) so users get the same feedback before
 * submitting.
 */

/** US number: 10 national digits, optionally prefixed with the country code 1. */
const US_PHONE_REGEX = /^\+?1?([2-9][0-9]{9})$/;

/** E.164 (`+1XXXXXXXXXX`) or `null` when not a valid US number. */
export const normalizeUsPhone = (value: string): string | null => {
  const digits = value.trim().replace(/[\s().-]/g, "");
  const match = US_PHONE_REGEX.exec(digits);
  return match ? `+1${match[1]}` : null;
};

/** `+15551234567` → `(555) 123-4567` for display; other input is returned as is. */
export const formatUsPhone = (value: string): string => {
  const normalized = normalizeUsPhone(value);
  if (!normalized) return value;
  const digits = normalized.slice(2);
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
