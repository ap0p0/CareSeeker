/**
 * Generic field parsers shared by the request validators.
 *
 * Each parser reads one raw value, pushes a human-readable message into
 * `errors` when it is invalid, and returns the normalized value (or an empty /
 * `null` value). Validators collect every message and answer with a single
 * `400 VALIDATION_ERROR`.
 */

/** Default length limit for "Other (specify)" free text. */
export const OTHER_TEXT_MAX_LENGTH = 100;

/**
 * Parses a multi-select answer: must be an array of known enum values
 * (case-insensitive), de-duplicated. Unknown values are rejected rather than
 * silently dropped so API clients notice typos.
 */
export function parseSelection<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
  errors: string[],
  options: { min?: number; exclude?: readonly T[] } = {},
): T[] {
  if (typeof value === 'undefined' || value === null) {
    if (options.min)
      errors.push(`${field} must include at least ${options.min} option`);
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array`);
    return [];
  }

  const allowedSet = new Set<string>(allowed);
  const excluded = new Set<string>(options.exclude ?? []);
  const unique = new Set<T>();

  for (const item of value) {
    const normalized =
      typeof item === 'string' ? item.trim().toUpperCase() : '';
    if (!allowedSet.has(normalized) || excluded.has(normalized)) {
      errors.push(`${field} contains an invalid option: ${String(item)}`);
      return [];
    }
    unique.add(normalized as T);
  }

  if (options.min && unique.size < options.min) {
    errors.push(`${field} must include at least ${options.min} option`);
  }

  return Array.from(unique);
}

/** Single-choice answer: a known enum value (case-insensitive). */
export function parseRequiredEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
  errors: string[],
): T | null {
  const text = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!text) {
    errors.push(`${field} is required`);
    return null;
  }

  if (!(allowed as readonly string[]).includes(text)) {
    errors.push(
      `${field} must be one of: ${allowed
        .map((item) => item.toLowerCase())
        .join(', ')}`,
    );
    return null;
  }

  return text as T;
}

export function parseText(
  value: unknown,
  field: string,
  errors: string[],
  options: { required: boolean; min?: number; max: number },
): string | null {
  if (typeof value === 'undefined' || value === null) {
    if (options.required) errors.push(`${field} is required`);
    return null;
  }

  if (typeof value !== 'string') {
    errors.push(`${field} must be a string`);
    return null;
  }

  const text = value.trim();
  if (!text) {
    if (options.required) errors.push(`${field} is required`);
    return null;
  }

  if (options.min && text.length < options.min) {
    errors.push(`${field} must be at least ${options.min} characters`);
    return null;
  }

  if (text.length > options.max) {
    errors.push(`${field} must be at most ${options.max} characters`);
    return null;
  }

  return text;
}

/**
 * "Other (specify)" text: required exactly when `OTHER` is selected, ignored
 * (stored as null) otherwise.
 */
export function parseOtherText(
  value: unknown,
  field: string,
  otherSelected: boolean,
  errors: string[],
  maxLength = OTHER_TEXT_MAX_LENGTH,
): string | null {
  if (!otherSelected) return null;

  const text = parseText(value, field, errors, {
    required: false,
    max: maxLength,
  });
  if (!text && !errors.some((error) => error.startsWith(`${field} `))) {
    errors.push(`${field} is required when "Other" is selected`);
  }

  return text;
}

/** Strict boolean (JSON `true` / `false`). */
export function parseBoolean(
  value: unknown,
  field: string,
  errors: string[],
): boolean {
  if (typeof value === 'boolean') return value;
  errors.push(`${field} must be true or false`);
  return false;
}

/** Whole number within `[min, max]`; numeric strings are accepted. */
export function parseInteger(
  value: unknown,
  field: string,
  errors: string[],
  min: number,
  max: number,
): number | null {
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;
  if (!Number.isInteger(number) || number < min || number > max) {
    errors.push(`${field} must be a whole number between ${min} and ${max}`);
    return null;
  }
  return number;
}

/** Like `parseInteger`, but `undefined` / `null` / `""` mean "not set". */
export function parseOptionalInteger(
  value: unknown,
  field: string,
  errors: string[],
  min: number,
  max: number,
): number | null {
  if (
    typeof value === 'undefined' ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return null;
  }
  return parseInteger(value, field, errors, min, max);
}
