const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ensureObject(payload: unknown) {
  return payload && typeof payload === 'object'
    ? (payload as Record<string, unknown>)
    : null;
}

export function isUuid(value: string) {
  return UUID_REGEX.test(value);
}

export function readRequiredString(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
) {
  const value = body[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} is required`);
    return '';
  }

  return value.trim();
}

export function readOptionalString(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
) {
  const value = body[field];
  if (typeof value === 'undefined' || value === null) return undefined;
  if (typeof value !== 'string') {
    errors.push(`${field} must be a string`);
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function readOptionalInteger(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
  minimum?: number,
) {
  const value = body[field];
  if (typeof value === 'undefined' || value === null) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    errors.push(`${field} must be an integer`);
    return undefined;
  }

  if (typeof minimum === 'number' && value < minimum) {
    errors.push(`${field} must be greater than or equal to ${minimum}`);
    return undefined;
  }

  return value;
}

export function readOptionalDate(
  body: Record<string, unknown>,
  field: string,
  errors: string[],
) {
  const value = body[field];
  if (typeof value === 'undefined' || value === null) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} must be a valid ISO date string`);
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.push(`${field} must be a valid ISO date string`);
    return undefined;
  }

  return date;
}

export function readOptionalEnum<T extends string>(
  body: Record<string, unknown>,
  field: string,
  allowedValues: readonly T[],
  errors: string[],
) {
  const value = body[field];
  if (typeof value === 'undefined' || value === null) return undefined;
  if (typeof value !== 'string') {
    errors.push(`${field} must be a string`);
    return undefined;
  }

  const normalized = value.trim().toUpperCase() as T;
  if (!allowedValues.includes(normalized)) {
    errors.push(`${field} must be one of: ${allowedValues.join(', ')}`);
    return undefined;
  }

  return normalized;
}

export function lowerCaseEnum(value: string | null | undefined) {
  return value ? value.toLowerCase() : null;
}
