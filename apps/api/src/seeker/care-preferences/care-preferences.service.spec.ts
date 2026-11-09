import { BadRequestException, ConflictException } from '@nestjs/common';
import type {
  CarePreferencesRecord,
  CarePreferencesRepository,
} from './care-preferences.repository';
import { CarePreferencesService } from './care-preferences.service';

const USER_ID = '55555555-5555-4555-8555-555555555555';
const UPDATED_AT = new Date('2026-08-04T10:00:00.000Z');

const baseRow = {
  id: 'prefs-id',
  userId: USER_ID,
  careTasks: ['MEAL_PREPARATION'],
  careFrequency: 'WEEKLY',
  visitDate: null,
  visitStartTime: null,
  visitEndTime: null,
  visitNotes: null,
  hoursPerWeek: 10,
  careDuration: 'LONG_TERM',
  scheduleFlexible: false,
  needsOvernightCare: false,
  needsLiveInCare: false,
  needsEmergencyCover: false,
  requiresCaregiverVehicle: false,
  requiresWheelchairAccessibleVehicle: false,
  petsInHome: false,
  specialRequirements: null,
  requiredQualifications: [],
  minYearsExperience: null,
  paymentType: 'HOURLY',
  budgetCents: 2500,
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
};

const record = (row: Record<string, unknown> = {}) =>
  ({
    carePreferences: { ...baseRow, ...row },
    careScheduleDays: [
      { userId: USER_ID, dayOfWeek: 1, mode: 'ALL_DAY' },
      { userId: USER_ID, dayOfWeek: 3, mode: 'AVAILABLE_WINDOWS' },
    ],
    careScheduleWindows: [
      {
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '12:00',
        endsNextDay: false,
      },
    ],
    seekersInfo: {
      careUrgency: 'ASAP',
      preferredCaregiverGender: 'NO_PREFERENCE',
      preferredCaregiverLanguage: null,
      homeAccessibility: ['ELEVATOR'],
      culturalConsiderationsNotes: null,
    },
  }) as unknown as CarePreferencesRecord;

const validBody = {
  careFrequency: 'weekly',
  careTasks: ['meal_preparation'],
  recurring: {
    hoursPerWeek: 10,
    careDuration: 'long_term',
    careUrgency: 'asap',
    scheduleDays: [{ dayOfWeek: 1, mode: 'all_day' }],
    needsLiveInCare: false,
    needsEmergencyCover: false,
  },
  scheduleFlexible: false,
  petsInHome: false,
  budget: { paymentType: 'hourly', amountCents: 2500 },
  caregiverPreferences: { gender: 'no_preference' },
};

describe('CarePreferencesService', () => {
  const repository = {
    isOnBehalfAccount: jest.fn(),
    findByUserId: jest.fn(),
    replaceByUserId: jest.fn(),
  };
  let service: CarePreferencesService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository.isOnBehalfAccount.mockResolvedValue(true);
    repository.findByUserId.mockResolvedValue(record());
    repository.replaceByUserId.mockResolvedValue(record());
    service = new CarePreferencesService(
      repository as unknown as CarePreferencesRepository,
    );
  });

  it('maps recurring care to the grouped API shape', async () => {
    const { completed, preferences } = await service.get(USER_ID);

    expect(completed).toBe(true);
    expect(preferences).toMatchObject({
      careFrequency: 'weekly',
      careTasks: ['meal_preparation'],
      visit: null,
      recurring: {
        hoursPerWeek: 10,
        careDuration: 'long_term',
        careUrgency: 'asap',
        scheduleDays: [
          { dayOfWeek: 1, mode: 'all_day', windows: [] },
          {
            dayOfWeek: 3,
            mode: 'available_windows',
            windows: [{ start: '09:00', end: '12:00', endsNextDay: false }],
          },
        ],
      },
      homeAccessibility: ['elevator'],
      budget: { paymentType: 'hourly', amountCents: 2500 },
      caregiverPreferences: { gender: 'no_preference', language: null },
      updatedAt: UPDATED_AT,
    });
  });

  it('maps a one-time visit without recurring details', async () => {
    repository.findByUserId.mockResolvedValue(
      record({
        careFrequency: 'ONE_TIME',
        visitDate: new Date('2026-08-12T00:00:00.000Z'),
        visitStartTime: '10:00',
        visitEndTime: '13:30',
        visitNotes: 'Cardiologist',
        hoursPerWeek: null,
        careDuration: null,
        paymentType: 'FIXED_PRICE',
        budgetCents: 9000,
      }),
    );

    const { preferences } = await service.get(USER_ID);
    expect(preferences).toMatchObject({
      careFrequency: 'one_time',
      visit: {
        date: '2026-08-12',
        startTime: '10:00',
        endTime: '13:30',
        notes: 'Cardiologist',
      },
      recurring: null,
      budget: { paymentType: 'fixed_price', amountCents: 9000 },
    });
  });

  it('reports an unsaved step as not completed', async () => {
    repository.findByUserId.mockResolvedValue({
      ...record(),
      carePreferences: null,
    });
    await expect(service.get(USER_ID)).resolves.toEqual({
      completed: false,
      preferences: null,
    });
  });

  it('validates before saving', async () => {
    await expect(
      service.save(USER_ID, { ...validBody, careTasks: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.replaceByUserId).not.toHaveBeenCalled();

    await expect(service.save(USER_ID, validBody)).resolves.toMatchObject({
      completed: true,
    });
    expect(repository.replaceByUserId).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({
        careFrequency: 'WEEKLY',
        visit: null,
        recurring: expect.objectContaining({
          scheduleDays: [{ dayOfWeek: 1, mode: 'ALL_DAY', windows: [] }],
        }) as unknown,
      }),
    );
  });

  it('rejects accounts registered for oneself', async () => {
    repository.isOnBehalfAccount.mockResolvedValue(false);
    await expect(service.get(USER_ID)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.save(USER_ID, validBody)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.replaceByUserId).not.toHaveBeenCalled();
  });
});
