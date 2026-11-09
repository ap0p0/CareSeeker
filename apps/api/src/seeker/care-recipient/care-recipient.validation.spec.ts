import { BadRequestException } from '@nestjs/common';
import { validateCareRecipientPayload } from './care-recipient.validation';

const TODAY = new Date('2026-08-02T12:00:00.000Z');

const validBody = {
  name: ' Rosa ',
  surname: 'Lopez',
  dateOfBirth: '1941-03-09',
  gender: 'female',
  addressLine1: '12 Oak St',
  city: 'Austin',
  state: 'tx',
  postalCode: '78701',
  livingSituation: 'live_alone',
  mobilityLevel: 'walking_aid',
  languagesSpoken: ['spanish', 'english'],
  ethnicBackground: 'latino',
  additionalInfo: '  Loves gardening. ',
};

const errorsFor = (payload: unknown): string[] => {
  try {
    validateCareRecipientPayload(payload, TODAY);
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    const response = (error as BadRequestException).getResponse() as {
      code: string;
      errors?: string[];
    };
    expect(response.code).toBe('VALIDATION_ERROR');
    return response.errors ?? [];
  }
  throw new Error('expected a VALIDATION_ERROR');
};

describe('validateCareRecipientPayload', () => {
  it('normalizes a valid payload', () => {
    expect(validateCareRecipientPayload(validBody, TODAY)).toEqual({
      name: 'Rosa',
      surname: 'Lopez',
      dateOfBirth: new Date('1941-03-09T00:00:00.000Z'),
      gender: 'FEMALE',
      addressLine1: '12 Oak St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      livingSituation: 'LIVE_ALONE',
      mobilityLevel: 'WALKING_AID',
      languagesSpoken: ['SPANISH', 'ENGLISH'],
      otherLanguage: null,
      ethnicBackground: 'LATINO',
      additionalInfo: 'Loves gardening.',
    });
  });

  it('accepts children (no minimum age) but not future dates', () => {
    expect(
      validateCareRecipientPayload(
        { ...validBody, dateOfBirth: '2026-01-15' },
        TODAY,
      ).dateOfBirth,
    ).toEqual(new Date('2026-01-15T00:00:00.000Z'));

    expect(errorsFor({ ...validBody, dateOfBirth: '2026-09-01' })).toContain(
      'dateOfBirth cannot be in the future',
    );
    expect(errorsFor({ ...validBody, dateOfBirth: '1890-01-01' })).toContain(
      'dateOfBirth is not a plausible date of birth',
    );
  });

  it('collects every missing field at once', () => {
    expect(errorsFor({})).toEqual(
      expect.arrayContaining([
        'name is required',
        'surname is required',
        'dateOfBirth is required',
        'gender is required',
        'addressLine1 is required',
        'city is required',
        'state is required',
        'postalCode is required',
        'livingSituation is required',
        'mobilityLevel is required',
        'languagesSpoken must include at least 1 option',
        'ethnicBackground is required',
      ]),
    );
  });

  it('requires the other-language text only when Other is selected', () => {
    expect(errorsFor({ ...validBody, languagesSpoken: ['other'] })).toEqual([
      'otherLanguage is required when "Other" is selected',
    ]);

    expect(
      validateCareRecipientPayload(
        { ...validBody, languagesSpoken: ['english'], otherLanguage: 'stale' },
        TODAY,
      ),
    ).toMatchObject({ otherLanguage: null });
  });

  it('no longer asks what help is needed (moved to step 3)', () => {
    expect(
      validateCareRecipientPayload(
        { ...validBody, basicCareNeeds: ['cooking'] },
        TODAY,
      ),
    ).not.toHaveProperty('basicCareNeeds');
  });

  it('rejects unknown options and invalid values', () => {
    const errors = errorsFor({
      ...validBody,
      gender: 'unknown',
      mobilityLevel: 'flying',
      languagesSpoken: ['english', 'klingon'],
      state: 'XX',
      postalCode: '123',
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('gender must be one of'),
        expect.stringContaining('mobilityLevel must be one of'),
        'languagesSpoken contains an invalid option: klingon',
        'state must be a valid US state code (e.g. TX)',
        'postalCode must be a US ZIP code (12345 or 12345-6789)',
      ]),
    );
  });

  it('limits free-text lengths', () => {
    expect(
      errorsFor({ ...validBody, additionalInfo: 'x'.repeat(2001) }),
    ).toEqual(['additionalInfo must be at most 2000 characters']);
  });
});
