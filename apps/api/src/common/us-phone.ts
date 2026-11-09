/**
 * US phone number handling shared by every registration flow (provider
 * onboarding, seeker registration on behalf of someone else, …).
 *
 * Numbers are stored in E.164 form (`+1XXXXXXXXXX`) so they compare equal no
 * matter how the user typed them.
 */

/** US number: 10 national digits, optionally prefixed with the country code 1. */
const US_PHONE_REGEX = /^\+?1?([2-9][0-9]{9})$/;

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

/**
 * Reads a required US phone field: pushes a message into `errors` when it is
 * missing or invalid and returns the E.164 value (or `null`).
 */
export function parseUsPhone(
  value: unknown,
  errors: string[],
  field = 'phone',
): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    errors.push(`${field} is required`);
    return null;
  }

  const normalized = normalizeUsPhone(text);
  if (!normalized) {
    errors.push(`${field} must be a valid US phone number (10 digits)`);
    return null;
  }

  return normalized;
}
