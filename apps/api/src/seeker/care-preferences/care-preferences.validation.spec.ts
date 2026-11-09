import { BadRequestException } from '@nestjs/common';
import { validateCarePreferencesPayload } from './care-preferences.validation';

const TODAY = new Date('2026-08-04T12:00:00.000Z');

const common = {
  scheduleFlexible: true,
  requiresWheelchairAccessibleVehicle: true,
  petsInHome: false,
  homeAccessibility: ['stairs'],
  specialRequirements: '  Low-sodium diet. ',
  caregiverPreferences: {
    gender: 'female',
    language: 'spanish',
    requiredQualifications: ['cna', 'cpr_first_aid_certification'],
    minYearsExperience: 2,
    culturalConsiderations: 'Catholic',
  },
};

const recurringBody = {
  ...common,
  careFrequency: 'weekly',
  careTasks: ['meal_preparation', 'transportation_driving', 'meal_preparation'],
  recurring: {
    hoursPerWeek: 12,
    careDuration: 'long_term',
    careUrgency: 'within_a_week',
    scheduleDays: [
      {
        dayOfWeek: 3,
        mode: 'available_windows',
        windows: [
          { start: '14:00', end: '18:00' },
          { start: '09:00', end: '12:00' },
        ],
      },
      {
        dayOfWeek: 1,
        mode: 'all_day',
        windows: [{ start: '01:00', end: '02:00' }],
      },
    ],
    needsLiveInCare: false,
    needsEmergencyCover: true,
  },
  budget: { paymentType: 'hourly', amountCents: 3000 },
};

const oneTimeBody = {
  ...common,
  careFrequency: 'one_time',
  careTasks: ['companionship'],
  visit: {
    date: '2026-08-12',
    startTime: '10:00',
    endTime: '13:30',
    notes: ' Take her to the cardiologist and back. ',
  },
  budget: { paymentType: 'fixed_price', amountCents: 9000 },
  // Recurring-only answers are ignored for one-time visits.
  recurring: { hoursPerWeek: 999 },
};

const errorsFor = (payload: unknown): string[] => {
  try {
    validateCarePreferencesPayload(payload, TODAY);
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

describe('validateCarePreferencesPayload — recurring care', () => {
  it('normalizes a valid payload and derives the car requirement', () => {
    expect(validateCarePreferencesPayload(recurringBody, TODAY)).toEqual({
      careFrequency: 'WEEKLY',
      careTasks: ['MEAL_PREPARATION', 'TRANSPORTATION_DRIVING'],
      visit: null,
      recurring: {
        hoursPerWeek: 12,
        careDuration: 'LONG_TERM',
        careUrgency: 'WITHIN_A_WEEK',
        // Sorted by day and window start; ALL_DAY drops stray windows.
        scheduleDays: [
          { dayOfWeek: 1, mode: 'ALL_DAY', windows: [] },
          {
            dayOfWeek: 3,
            mode: 'AVAILABLE_WINDOWS',
            windows: [
              { start: '09:00', end: '12:00', endsNextDay: false },
              { start: '14:00', end: '18:00', endsNextDay: false },
            ],
          },
        ],
        needsLiveInCare: false,
        needsEmergencyCover: true,
      },
      scheduleFlexible: true,
      needsOvernightCare: false,
      requiresCaregiverVehicle: true,
      requiresWheelchairAccessibleVehicle: true,
      petsInHome: false,
      homeAccessibility: ['STAIRS'],
      specialRequirements: 'Low-sodium diet.',
      budget: { paymentType: 'HOURLY', amountCents: 3000 },
      caregiverPreferences: {
        gender: 'FEMALE',
        language: 'SPANISH',
        requiredQualifications: ['CNA', 'CPR_FIRST_AID_CERTIFICATION'],
        minYearsExperience: 2,
        culturalConsiderations: 'Catholic',
      },
    });
  });

  it('requires the recurring answers', () => {
    expect(
      errorsFor({ ...recurringBody, recurring: { scheduleDays: [] } }),
    ).toEqual([
      'recurring.hoursPerWeek must be a whole number between 1 and 168',
      'recurring.careDuration is required',
      'recurring.careUrgency is required',
      'recurring.scheduleDays must include at least one day',
      'recurring.needsLiveInCare must be true or false',
      'recurring.needsEmergencyCover must be true or false',
    ]);
    expect(errorsFor({ ...recurringBody, recurring: undefined })).toEqual([
      'recurring is required for daily, weekly or monthly care',
    ]);
  });

  it('derives overnight care from the task or from overnight hours', () => {
    expect(
      validateCarePreferencesPayload(
        {
          ...recurringBody,
          recurring: {
            ...recurringBody.recurring,
            scheduleDays: [
              {
                dayOfWeek: 5,
                mode: 'available_windows',
                windows: [{ start: '21:00', end: '07:00', endsNextDay: true }],
              },
            ],
          },
        },
        TODAY,
      ).needsOvernightCare,
    ).toBe(true);

    expect(
      validateCarePreferencesPayload(
        { ...recurringBody, careTasks: ['overnight_care'] },
        TODAY,
      ),
    ).toMatchObject({
      needsOvernightCare: true,
      // No driving task: no car, whatever the wheelchair answer says.
      requiresCaregiverVehicle: false,
      requiresWheelchairAccessibleVehicle: false,
    });
  });

  it('turns pets on when pet care is needed', () => {
    expect(
      validateCarePreferencesPayload(
        { ...recurringBody, careTasks: ['pet_care'], petsInHome: false },
        TODAY,
      ).petsInHome,
    ).toBe(true);
  });

  it('keeps the budget optional for recurring care', () => {
    expect(
      validateCarePreferencesPayload(
        { ...recurringBody, budget: { paymentType: 'fixed_price' } },
        TODAY,
      ).budget,
    ).toEqual({ paymentType: 'FIXED_PRICE', amountCents: null });
  });

  it('does not let seekers block hours and validates windows', () => {
    expect(
      errorsFor({
        ...recurringBody,
        recurring: {
          ...recurringBody.recurring,
          scheduleDays: [
            { dayOfWeek: 2, mode: 'blocked_windows', windows: [] },
            {
              dayOfWeek: 4,
              mode: 'available_windows',
              windows: [
                { start: '09:00', end: '13:00' },
                { start: '12:00', end: '15:00' },
              ],
            },
          ],
        },
      }),
    ).toEqual([
      'recurring.scheduleDays[0].mode must be one of: all_day, available_windows',
      'recurring.scheduleDays[1].windows must not overlap',
    ]);
  });
});

describe('validateCarePreferencesPayload — one-time visit', () => {
  it('keeps only the visit shape and ignores recurring answers', () => {
    expect(validateCarePreferencesPayload(oneTimeBody, TODAY)).toMatchObject({
      careFrequency: 'ONE_TIME',
      careTasks: ['COMPANIONSHIP'],
      visit: {
        date: new Date('2026-08-12T00:00:00.000Z'),
        startTime: '10:00',
        endTime: '13:30',
        notes: 'Take her to the cardiologist and back.',
      },
      recurring: null,
      needsOvernightCare: false,
      budget: { paymentType: 'FIXED_PRICE', amountCents: 9000 },
    });
  });

  it('requires a date, hours and a budget', () => {
    expect(
      errorsFor({
        ...oneTimeBody,
        visit: { date: '2026-08-12', startTime: '15:00', endTime: '09:00' },
        budget: { paymentType: 'hourly' },
      }),
    ).toEqual([
      'visit.endTime must be after visit.startTime',
      'budget.amountCents must be a whole number between 1 and 50000',
    ]);
    expect(errorsFor({ ...oneTimeBody, visit: undefined })).toEqual([
      'visit is required for one-time care',
    ]);
  });

  it('rejects past dates (one day of time-zone slack) and far-away ones', () => {
    expect(
      validateCarePreferencesPayload(
        { ...oneTimeBody, visit: { ...oneTimeBody.visit, date: '2026-08-03' } },
        TODAY,
      ).visit?.date,
    ).toEqual(new Date('2026-08-03T00:00:00.000Z'));
    expect(
      errorsFor({
        ...oneTimeBody,
        visit: { ...oneTimeBody.visit, date: '2026-08-01' },
      }),
    ).toEqual(['visit.date cannot be in the past']);
    expect(
      errorsFor({
        ...oneTimeBody,
        visit: { ...oneTimeBody.visit, date: '2027-12-01' },
      }),
    ).toEqual(['visit.date must be within 365 days from today']);
  });

  it('caps fixed prices at $10,000', () => {
    expect(
      errorsFor({
        ...oneTimeBody,
        budget: { paymentType: 'fixed_price', amountCents: 1_000_001 },
      }),
    ).toEqual([
      'budget.amountCents must be a whole number between 1 and 1000000',
    ]);
  });
});

describe('validateCarePreferencesPayload — common rules', () => {
  it('collects every missing required answer at once', () => {
    expect(errorsFor({})).toEqual([
      'careTasks must include at least 1 option',
      'careFrequency is required',
      'scheduleFlexible must be true or false',
      'petsInHome must be true or false',
      'budget.paymentType is required',
      'caregiverPreferences.gender is required',
    ]);
  });

  it('rejects unknown options', () => {
    expect(
      errorsFor({
        ...recurringBody,
        careTasks: ['juggling'],
        caregiverPreferences: {
          gender: 'female',
          language: 'other',
          requiredQualifications: ['other'],
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        'careTasks contains an invalid option: juggling',
        expect.stringContaining('caregiverPreferences.language must be one of'),
        'caregiverPreferences.requiredQualifications contains an invalid option: other',
      ]),
    );
  });
});
