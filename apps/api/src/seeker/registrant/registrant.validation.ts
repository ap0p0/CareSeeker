import { BadRequestException } from '@nestjs/common';
import { RegistrantRelationship } from '../../../generated/prisma/client.js';
import {
  parseName,
  parseRequiredText,
  readString,
} from '../../common/personal-info.validation';
import { parseUsPhone } from '../../common/us-phone';
import type {
  RegisterSeekerOnBehalfPayload,
  UpdateRegistrantPayload,
} from './registrant.types';

/**
 * Validation for step 1 of the "register on behalf of someone else" flow:
 * the registrant — the person opening the account — and their credentials.
 *
 * Every rule is enforced here regardless of what the frontend checked, so
 * API clients get the same behaviour. Messages are collected per field and
 * returned together as a single `400 VALIDATION_ERROR`.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;
export const RELATIONSHIP_OTHER_MAX_LENGTH = 100;

const RELATIONSHIPS = new Set<string>(Object.values(RegistrantRelationship));

function requireObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Payload must be an object',
    });
  }

  return payload as Record<string, unknown>;
}

/**
 * Account credentials. `confirmPassword` is optional on the wire (the
 * frontend already compares both) but must match when present.
 */
export function parseCredentials(
  body: Record<string, unknown>,
  errors: string[],
): { email: string; password: string } | null {
  const email = readString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : null;

  if (!email) {
    errors.push('email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('email must be a valid email address');
  }

  if (!password) {
    errors.push('password is required');
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (confirmPassword !== null && confirmPassword !== password) {
    errors.push('confirmPassword must match password');
  }

  if (!email || !EMAIL_REGEX.test(email) || !password) {
    return null;
  }

  return { email, password };
}

/**
 * `relationship` must be one of `RegistrantRelationship` (case-insensitive,
 * e.g. `child`). `relationshipOther` is required for `OTHER` and ignored
 * (cleared) for every other value so stale text never gets stored.
 */
export function parseRelationship(
  body: Record<string, unknown>,
  errors: string[],
): {
  relationship: RegistrantRelationship;
  relationshipOther: string | null;
} | null {
  const raw = readString(body.relationship).toUpperCase();
  let relationship: RegistrantRelationship | null = null;

  if (!raw) {
    errors.push('relationship is required');
  } else if (!RELATIONSHIPS.has(raw)) {
    errors.push(
      `relationship must be one of: ${Object.values(RegistrantRelationship)
        .map((item) => item.toLowerCase())
        .join(', ')}`,
    );
  } else {
    relationship = raw as RegistrantRelationship;
  }

  let relationshipOther: string | null = null;
  if (relationship === RegistrantRelationship.OTHER) {
    relationshipOther = parseRequiredText(
      body.relationshipOther,
      'relationshipOther',
      RELATIONSHIP_OTHER_MAX_LENGTH,
      errors,
    );
    if (!relationshipOther) return null;
  } else if (
    typeof body.relationshipOther !== 'undefined' &&
    body.relationshipOther !== null &&
    typeof body.relationshipOther !== 'string'
  ) {
    errors.push('relationshipOther must be a string');
    return null;
  }

  return relationship ? { relationship, relationshipOther } : null;
}

/**
 * The registrant must explicitly confirm they may arrange care for the
 * recipient. Accepts `true` or the string `"true"` (form posts).
 */
export function parseConsent(value: unknown, errors: string[]): boolean {
  const confirmed = value === true || value === 'true';
  if (!confirmed) {
    errors.push(
      'consentToActOnBehalf must be accepted to register on behalf of someone else',
    );
  }
  return confirmed;
}

/** Registrant details that can be edited after the account exists. */
function parseRegistrantDetails(
  body: Record<string, unknown>,
  errors: string[],
) {
  return {
    name: parseName(body.name, 'name', errors),
    surname: parseName(body.surname, 'surname', errors),
    phone: parseUsPhone(body.phone, errors),
    relationship: parseRelationship(body, errors),
  };
}

export function validateRegisterOnBehalfPayload(
  payload: unknown,
): RegisterSeekerOnBehalfPayload {
  const body = requireObject(payload);
  const errors: string[] = [];

  const { name, surname, phone, relationship } = parseRegistrantDetails(
    body,
    errors,
  );
  const credentials = parseCredentials(body, errors);
  const consent = parseConsent(body.consentToActOnBehalf, errors);

  if (
    errors.length > 0 ||
    !name ||
    !surname ||
    !credentials ||
    !phone ||
    !relationship ||
    !consent
  ) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid registrant payload',
      errors,
    });
  }

  return {
    name,
    surname,
    email: credentials.email,
    password: credentials.password,
    phone,
    relationship: relationship.relationship,
    relationshipOther: relationship.relationshipOther,
    consentToActOnBehalf: true,
  };
}

/**
 * `PUT /seeker/registrant`: full replacement of the editable registrant
 * details. Email / password are account settings and consent was recorded at
 * registration, so neither is accepted here.
 */
export function validateUpdateRegistrantPayload(
  payload: unknown,
): UpdateRegistrantPayload {
  const body = requireObject(payload);
  const errors: string[] = [];

  const { name, surname, phone, relationship } = parseRegistrantDetails(
    body,
    errors,
  );

  if (errors.length > 0 || !name || !surname || !phone || !relationship) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid registrant payload',
      errors,
    });
  }

  return {
    name,
    surname,
    phone,
    relationship: relationship.relationship,
    relationshipOther: relationship.relationshipOther,
  };
}
