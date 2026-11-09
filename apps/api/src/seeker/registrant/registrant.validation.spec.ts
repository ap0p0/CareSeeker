import { BadRequestException } from '@nestjs/common';
import {
  parseConsent,
  parseCredentials,
  parseRelationship,
  validateRegisterOnBehalfPayload,
  validateUpdateRegistrantPayload,
} from './registrant.validation';

const validBody = {
  name: '  Maria ',
  surname: 'Lopez',
  email: 'Maria.Lopez@Example.com',
  password: 'secret123',
  confirmPassword: 'secret123',
  phone: '(555) 123-4567',
  relationship: 'child',
  consentToActOnBehalf: true,
};

const expectValidationError = (payload: unknown, ...messages: string[]) => {
  try {
    validateRegisterOnBehalfPayload(payload);
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    const response = (error as BadRequestException).getResponse() as {
      code: string;
      errors?: string[];
    };
    expect(response.code).toBe('VALIDATION_ERROR');
    for (const message of messages) {
      expect(response.errors).toEqual(
        expect.arrayContaining([expect.stringContaining(message)]),
      );
    }
    return;
  }

  throw new Error('expected a VALIDATION_ERROR');
};

describe('validateRegisterOnBehalfPayload', () => {
  it('normalizes a valid registrant payload', () => {
    expect(validateRegisterOnBehalfPayload(validBody)).toEqual({
      name: 'Maria',
      surname: 'Lopez',
      email: 'maria.lopez@example.com',
      password: 'secret123',
      phone: '+15551234567',
      relationship: 'CHILD',
      relationshipOther: null,
      consentToActOnBehalf: true,
    });
  });

  it('keeps the free-text relationship only for "other"', () => {
    expect(
      validateRegisterOnBehalfPayload({
        ...validBody,
        relationship: 'OTHER',
        relationshipOther: ' Former colleague ',
      }),
    ).toMatchObject({
      relationship: 'OTHER',
      relationshipOther: 'Former colleague',
    });

    expect(
      validateRegisterOnBehalfPayload({
        ...validBody,
        relationship: 'friend_neighbor',
        relationshipOther: 'stale text',
      }),
    ).toMatchObject({
      relationship: 'FRIEND_NEIGHBOR',
      relationshipOther: null,
    });
  });

  it('rejects non-object payloads', () => {
    expect(() => validateRegisterOnBehalfPayload(null)).toThrow(
      BadRequestException,
    );
    expect(() => validateRegisterOnBehalfPayload('nope')).toThrow(
      BadRequestException,
    );
  });

  it('collects every field error at once', () => {
    expectValidationError(
      {},
      'name is required',
      'surname is required',
      'email is required',
      'password is required',
      'phone is required',
      'relationship is required',
      'consentToActOnBehalf must be accepted',
    );
  });

  it('requires the consent confirmation', () => {
    expectValidationError(
      { ...validBody, consentToActOnBehalf: false },
      'consentToActOnBehalf',
    );
    expectValidationError(
      { ...validBody, consentToActOnBehalf: 'yes' },
      'consentToActOnBehalf',
    );
  });

  it('requires a US phone number', () => {
    expectValidationError(
      { ...validBody, phone: '+44 20 7946 0958' },
      'phone must be a valid US phone number',
    );
  });

  it('requires the free text when relationship is "other"', () => {
    expectValidationError(
      { ...validBody, relationship: 'other' },
      'relationshipOther is required',
    );
    expectValidationError(
      {
        ...validBody,
        relationship: 'other',
        relationshipOther: 'x'.repeat(101),
      },
      'relationshipOther must be at most 100 characters',
    );
  });

  it('rejects unknown relationships', () => {
    expectValidationError(
      { ...validBody, relationship: 'cousin' },
      'relationship must be one of',
    );
  });

  it('enforces the credential rules', () => {
    expectValidationError(
      { ...validBody, email: 'not-an-email' },
      'email must be a valid email address',
    );
    expectValidationError(
      { ...validBody, password: '123', confirmPassword: '123' },
      'password must be at least 6 characters',
    );
    expectValidationError(
      { ...validBody, confirmPassword: 'different' },
      'confirmPassword must match password',
    );
  });

  it('limits name lengths', () => {
    expectValidationError(
      { ...validBody, name: 'a'.repeat(101) },
      'name must be at most 100 characters',
    );
  });
});

describe('field parsers', () => {
  it('parseCredentials accepts a missing confirmPassword', () => {
    const errors: string[] = [];
    expect(
      parseCredentials({ email: 'A@b.co', password: 'secret123' }, errors),
    ).toEqual({ email: 'a@b.co', password: 'secret123' });
    expect(errors).toEqual([]);
  });

  it('parseRelationship is case-insensitive', () => {
    const errors: string[] = [];
    expect(
      parseRelationship({ relationship: 'Legal_Guardian' }, errors),
    ).toEqual({ relationship: 'LEGAL_GUARDIAN', relationshipOther: null });
    expect(errors).toEqual([]);
  });

  it('parseRelationship rejects a non-string relationshipOther', () => {
    const errors: string[] = [];
    expect(
      parseRelationship(
        { relationship: 'parent', relationshipOther: 5 },
        errors,
      ),
    ).toBeNull();
    expect(errors).toEqual(['relationshipOther must be a string']);
  });

  it('parseConsent accepts true and "true" only', () => {
    expect(parseConsent(true, [])).toBe(true);
    expect(parseConsent('true', [])).toBe(true);

    const errors: string[] = [];
    expect(parseConsent(1, errors)).toBe(false);
    expect(parseConsent(undefined, errors)).toBe(false);
    expect(errors).toHaveLength(2);
  });
});

describe('validateUpdateRegistrantPayload', () => {
  it('does not require credentials or consent', () => {
    expect(
      validateUpdateRegistrantPayload({
        name: 'Maria',
        surname: 'Lopez',
        phone: '555-123-4567',
        relationship: 'sibling',
        relationshipOther: 'ignored',
      }),
    ).toEqual({
      name: 'Maria',
      surname: 'Lopez',
      phone: '+15551234567',
      relationship: 'SIBLING',
      relationshipOther: null,
    });
  });

  it('applies the same rules as registration', () => {
    expect(() =>
      validateUpdateRegistrantPayload({
        name: 'Maria',
        surname: 'Lopez',
        phone: '123',
        relationship: 'other',
      }),
    ).toThrow(BadRequestException);
  });
});
