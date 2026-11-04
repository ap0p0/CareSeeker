import { validateWorkPreferencesPayload } from './work-preferences.validation';

const valid = {
  workingDays: [
    { dayOfWeek: 1, mode: 'all_day', windows: [] },
    {
      dayOfWeek: 3,
      mode: 'available_windows',
      windows: [
        { start: '13:00', end: '17:00' },
        { start: '08:00', end: '12:00' },
      ],
    },
    {
      dayOfWeek: 6,
      mode: 'blocked_windows',
      windows: [{ start: '12:00', end: '14:00' }],
    },
  ],
  workType: 'part_time',
  availabilityStart: 'immediate',
  acceptsHourly: true,
  acceptsFixedPrice: false,
  acceptsOneTimeJobs: true,
  acceptsDailyJobs: false,
  acceptsWeeklyJobs: true,
  acceptsMonthlyJobs: false,
  availableOvernight: false,
  availableLiveIn: false,
  availableEmergency: true,
  maxTravelDistanceMiles: 25,
  offersTransportation: true,
  vehicleType: 'van',
  vehicleWheelchairAccessible: true,
  minWeeklyHours: 10,
  maxWeeklyHours: 30,
  preferredHourlyRateCents: 2800,
  minHourlyRateCents: 2200,
  matchingNotes: '  I prefer clients close to downtown.  ',
};

const errorsOf = (body: unknown): string[] => {
  try {
    validateWorkPreferencesPayload(body);
    return [];
  } catch (error) {
    return (error as { response: { errors: string[] } }).response.errors;
  }
};

describe('validateWorkPreferencesPayload', () => {
  it('normalizes enums, sorts windows and trims notes', () => {
    const result = validateWorkPreferencesPayload(valid);

    expect(result.workType).toBe('PART_TIME');
    expect(result.workingDays.map((day) => day.dayOfWeek)).toEqual([1, 3, 6]);
    expect(result.workingDays[1]).toEqual({
      dayOfWeek: 3,
      mode: 'AVAILABLE_WINDOWS',
      windows: [
        { start: '08:00', end: '12:00', endsNextDay: false },
        { start: '13:00', end: '17:00', endsNextDay: false },
      ],
    });
    expect(result.workingDays[2].mode).toBe('BLOCKED_WINDOWS');
    expect(result.vehicleType).toBe('VAN');
    expect(result.matchingNotes).toBe('I prefer clients close to downtown.');
    expect(result.availableFrom).toBeNull();
  });

  it('requires a start date for specific_date and rejects past dates', () => {
    expect(errorsOf({ ...valid, availabilityStart: 'specific_date' })).toEqual([
      'availableFrom must be a date in YYYY-MM-DD format when availabilityStart is specific_date',
    ]);
    expect(
      errorsOf({
        ...valid,
        availabilityStart: 'specific_date',
        availableFrom: '2000-01-01',
      }),
    ).toEqual(['availableFrom cannot be in the past']);
    const result = validateWorkPreferencesPayload({
      ...valid,
      availabilityStart: 'specific_date',
      availableFrom: '2999-12-31',
    });
    expect(result.availableFrom?.toISOString()).toBe(
      '2999-12-31T00:00:00.000Z',
    );
  });

  it('validates the weekly schedule', () => {
    expect(errorsOf({ ...valid, workingDays: [] })).toEqual([
      'workingDays must include at least one day',
    ]);
    expect(
      errorsOf({
        ...valid,
        workingDays: [
          { dayOfWeek: 1, mode: 'available_windows', windows: [] },
          { dayOfWeek: 1, mode: 'all_day', windows: [] },
          { dayOfWeek: 7, mode: 'all_day', windows: [] },
          {
            dayOfWeek: 2,
            mode: 'available_windows',
            windows: [{ start: '17:00', end: '09:00' }],
          },
          {
            dayOfWeek: 4,
            mode: 'blocked_windows',
            windows: [
              { start: '08:00', end: '12:00' },
              { start: '11:00', end: '13:00' },
            ],
          },
        ],
      }),
    ).toEqual([
      'workingDays[0].windows must include at least one time window for this mode',
      'workingDays[1].dayOfWeek 1 is listed more than once',
      'workingDays[2].dayOfWeek must be a whole number between 0 and 6',
      'workingDays[3].windows[0] must end after it starts (set endsNextDay for overnight hours)',
      'workingDays[4].windows must not overlap',
    ]);
  });

  it('supports overnight windows that end on the next day', () => {
    const result = validateWorkPreferencesPayload({
      ...valid,
      workingDays: [
        {
          dayOfWeek: 5,
          mode: 'available_windows',
          windows: [
            { start: '22:00', end: '06:00', endsNextDay: true },
            { start: '08:00', end: '12:00' },
          ],
        },
      ],
    });
    expect(result.workingDays[0].windows).toEqual([
      { start: '08:00', end: '12:00', endsNextDay: false },
      { start: '22:00', end: '06:00', endsNextDay: true },
    ]);

    expect(
      errorsOf({
        ...valid,
        workingDays: [
          {
            dayOfWeek: 5,
            mode: 'available_windows',
            windows: [{ start: '22:00', end: '23:00', endsNextDay: true }],
          },
          {
            dayOfWeek: 6,
            mode: 'blocked_windows',
            windows: [
              { start: '20:00', end: '23:00' },
              { start: '22:00', end: '02:00', endsNextDay: true },
            ],
          },
        ],
      }),
    ).toEqual([
      'workingDays[0].windows[0] cannot be longer than 24 hours',
      'workingDays[1].windows must not overlap',
    ]);
  });

  it('enforces choices, ranges and ordering', () => {
    expect(
      errorsOf({
        ...valid,
        acceptsHourly: false,
        acceptsFixedPrice: false,
        acceptsOneTimeJobs: false,
        acceptsWeeklyJobs: false,
        maxTravelDistanceMiles: 150,
        minWeeklyHours: 40,
        maxWeeklyHours: 20,
        minHourlyRateCents: 3000,
        matchingNotes: 'x'.repeat(1001),
      }),
    ).toEqual([
      'At least one of acceptsHourly or acceptsFixedPrice must be true',
      'At least one job frequency (one-time, daily, weekly, monthly) must be accepted',
      'maxTravelDistanceMiles must be a whole number between 1 and 100',
      'minWeeklyHours cannot exceed maxWeeklyHours',
      'minHourlyRateCents cannot exceed preferredHourlyRateCents',
      'matchingNotes must be at most 1000 characters',
    ]);
  });

  it('requires vehicle details only when transportation is offered', () => {
    expect(
      errorsOf({
        ...valid,
        vehicleType: undefined,
        vehicleWheelchairAccessible: undefined,
      }),
    ).toEqual([
      'vehicleType is required',
      'vehicleWheelchairAccessible must be true or false',
    ]);
    const result = validateWorkPreferencesPayload({
      ...valid,
      offersTransportation: false,
      vehicleType: 'van',
      vehicleWheelchairAccessible: true,
    });
    expect(result.vehicleType).toBeNull();
    expect(result.vehicleWheelchairAccessible).toBeNull();
  });
});
