import { BadRequestException } from '@nestjs/common';
import {
  validateJobPostPayload,
  validateJobTextPayload,
} from './jobs.validation';

const TODAY = new Date('2026-08-06T12:00:00.000Z');

const details = {
  careFrequency: 'weekly',
  careTasks: ['meal_preparation', 'transportation_driving'],
  recurring: {
    hoursPerWeek: 12,
    careDuration: 'long_term',
    careUrgency: 'asap',
    scheduleDays: [
      {
        dayOfWeek: 1,
        mode: 'available_windows',
        windows: [{ start: '22:00', end: '06:00', endsNextDay: true }],
      },
    ],
    needsLiveInCare: false,
    needsEmergencyCover: false,
  },
  scheduleFlexible: false,
  requiresWheelchairAccessibleVehicle: true,
  petsInHome: false,
  homeAccessibility: ['stairs'],
  specialRequirements: null,
  budget: { paymentType: 'hourly', amountCents: 3000 },
  caregiverPreferences: { gender: 'no_preference' },
};

const post = {
  title: '  Part-time caregiver for my mother in Austin, TX ',
  description:
    'I am looking for a caregiver to help my mother with meals and driving.',
  city: ' Austin ',
  state: 'tx',
  postalCode: '78701',
  details,
};

const errorsFor = (run: () => unknown): string[] => {
  try {
    run();
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

describe('validateJobPostPayload', () => {
  it('normalizes the post and validates the details like care preferences', () => {
    const input = validateJobPostPayload(post, TODAY);

    expect(input).toMatchObject({
      title: 'Part-time caregiver for my mother in Austin, TX',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      details: {
        careFrequency: 'WEEKLY',
        careTasks: ['MEAL_PREPARATION', 'TRANSPORTATION_DRIVING'],
        // Derived exactly like the profile: driving → car, overnight window.
        requiresCaregiverVehicle: true,
        requiresWheelchairAccessibleVehicle: true,
        needsOvernightCare: true,
        caregiverPreferences: { gender: 'NO_PREFERENCE', language: null },
      },
    });
  });

  it('does not store a street address', () => {
    const input = validateJobPostPayload(
      { ...post, addressLine1: '1 Main St' },
      TODAY,
    );
    expect(input).not.toHaveProperty('addressLine1');
  });

  it('reports every problem at once, details prefixed', () => {
    const errors = errorsFor(() =>
      validateJobPostPayload(
        {
          title: 'Hi',
          description: '',
          city: '',
          state: 'XX',
          postalCode: '7870',
          details: { ...details, careTasks: [], budget: undefined },
        },
        TODAY,
      ),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        'title must be at least 5 characters',
        'description is required',
        'city is required',
        'state must be a valid US state code (e.g. TX)',
        'postalCode must be a US ZIP code (12345 or 12345-6789)',
        'details.careTasks must include at least 1 option',
        'details.budget.paymentType is required',
      ]),
    );
  });

  it('requires the details and rejects over-long text', () => {
    expect(
      errorsFor(() =>
        validateJobPostPayload(
          { ...post, title: 'x'.repeat(101), details: undefined },
          TODAY,
        ),
      ),
    ).toEqual(['title must be at most 100 characters', 'details is required']);
  });

  it('applies the one-time visit rules (no past visits)', () => {
    const errors = errorsFor(() =>
      validateJobPostPayload(
        {
          ...post,
          details: {
            ...details,
            careFrequency: 'one_time',
            visit: { date: '2026-07-01', startTime: '10:00', endTime: '12:00' },
            budget: { paymentType: 'fixed_price', amountCents: 9000 },
          },
        },
        TODAY,
      ),
    );
    expect(errors).toEqual(['details.visit.date cannot be in the past']);
  });

  it('rejects non-object payloads', () => {
    expect(() => validateJobPostPayload(null)).toThrow(BadRequestException);
    expect(() => validateJobPostPayload([post])).toThrow(BadRequestException);
  });
});

describe('validateJobTextPayload', () => {
  it('needs the location and details, not the text', () => {
    const rest = {
      city: post.city,
      state: post.state,
      postalCode: post.postalCode,
      details,
    };
    expect(validateJobTextPayload(rest, TODAY)).toMatchObject({
      city: 'Austin',
      state: 'TX',
      details: { careFrequency: 'WEEKLY' },
    });
    expect(
      errorsFor(() => validateJobTextPayload({ ...rest, city: '' }, TODAY)),
    ).toEqual(['city is required']);
  });
});
