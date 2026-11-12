import {
  describeDays,
  formatClock,
  generateJobText,
  joinAnd,
  withArticle,
} from './job-text.generator';
import type { JobDetails, JobTextContext } from './jobs.types';
import {
  JOB_DESCRIPTION_MIN_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  JOB_TITLE_MIN_LENGTH,
} from './jobs.validation';

const TODAY = new Date('2026-08-06T12:00:00.000Z');

const weekly: JobDetails = {
  careFrequency: 'WEEKLY',
  careTasks: ['BATHING_HYGIENE', 'MEAL_PREPARATION', 'MEDICATION_REMINDERS'],
  visit: null,
  recurring: {
    hoursPerWeek: 12,
    careDuration: 'LONG_TERM',
    careUrgency: 'ASAP',
    scheduleDays: [
      { dayOfWeek: 1, mode: 'ALL_DAY', windows: [] },
      {
        dayOfWeek: 3,
        mode: 'AVAILABLE_WINDOWS',
        windows: [{ start: '09:00', end: '12:00', endsNextDay: false }],
      },
      { dayOfWeek: 5, mode: 'ALL_DAY', windows: [] },
    ],
    needsLiveInCare: false,
    needsEmergencyCover: true,
  },
  scheduleFlexible: true,
  needsOvernightCare: false,
  requiresCaregiverVehicle: false,
  requiresWheelchairAccessibleVehicle: false,
  petsInHome: true,
  homeAccessibility: ['STAIRS'],
  specialRequirements: 'Low-sodium diet.',
  budget: { paymentType: 'HOURLY', amountCents: 3000 },
  caregiverPreferences: {
    gender: 'FEMALE',
    language: 'SPANISH',
    requiredQualifications: ['CNA'],
    minYearsExperience: 2,
    culturalConsiderations: null,
  },
};

const oneTime: JobDetails = {
  ...weekly,
  careFrequency: 'ONE_TIME',
  careTasks: ['TRANSPORTATION_DRIVING', 'COMPANIONSHIP'],
  recurring: null,
  visit: {
    date: new Date('2026-08-12T00:00:00.000Z'),
    startTime: '10:00',
    endTime: '13:30',
    notes: 'Cardiologist at 10:30.',
  },
  scheduleFlexible: false,
  requiresCaregiverVehicle: true,
  requiresWheelchairAccessibleVehicle: true,
  budget: { paymentType: 'FIXED_PRICE', amountCents: 9000 },
};

/** Registered by her child: the recipient is "my mother". */
const mother: JobTextContext = {
  careFor: 'other',
  relationship: 'CHILD',
  recipient: {
    gender: 'FEMALE',
    dateOfBirth: new Date('1944-03-09T00:00:00.000Z'),
    mobilityLevel: 'WALKING_AID',
    languagesSpoken: ['SPANISH', 'ENGLISH'],
    otherLanguage: null,
  },
  city: 'Austin',
  state: 'TX',
  today: TODAY,
};

describe('generateJobText — recurring care', () => {
  it('writes a title and short description from the profile', () => {
    expect(generateJobText(weekly, mother)).toEqual({
      title: 'Part-time caregiver for my mother in Austin, TX',
      description:
        'I am looking for a caregiver to help my 82-year-old mother in Austin, TX with bathing and personal hygiene, meal preparation, and medication reminders. ' +
        'Care is needed on Mondays, Wednesdays, and Fridays (about 12 hours a week). ' +
        'It should start as soon as possible and will likely last more than six months. ' +
        'The schedule is flexible. ' +
        'She walks with a cane or walker and speaks Spanish and English. ' +
        'A female caregiver who speaks Spanish is preferred.',
    });
  });

  it('picks the kind of caregiver from the schedule', () => {
    const title = (details: JobDetails) =>
      generateJobText(details, mother).title;
    const recurring = weekly.recurring!;

    expect(
      title({ ...weekly, recurring: { ...recurring, hoursPerWeek: 40 } }),
    ).toBe('Full-time caregiver for my mother in Austin, TX');
    expect(title({ ...weekly, careFrequency: 'MONTHLY' })).toBe(
      'Occasional caregiver for my mother in Austin, TX',
    );
    const night = { start: '22:00', end: '06:00', endsNextDay: true };
    expect(
      title({
        ...weekly,
        needsOvernightCare: true,
        recurring: {
          ...recurring,
          scheduleDays: [
            { dayOfWeek: 1, mode: 'AVAILABLE_WINDOWS', windows: [night] },
            { dayOfWeek: 2, mode: 'AVAILABLE_WINDOWS', windows: [night] },
          ],
        },
      }),
    ).toBe('Overnight caregiver for my mother in Austin, TX');
    // One night among day shifts: still a part-time job.
    const mixed = generateJobText(
      {
        ...weekly,
        needsOvernightCare: true,
        recurring: {
          ...recurring,
          scheduleDays: [
            ...recurring.scheduleDays,
            { dayOfWeek: 6, mode: 'AVAILABLE_WINDOWS', windows: [night] },
          ],
        },
      },
      mother,
    );
    expect(mixed.title).toBe('Part-time caregiver for my mother in Austin, TX');
    expect(mixed.description).toContain('Some overnight care is needed.');
    expect(
      title({
        ...weekly,
        needsOvernightCare: true,
        recurring: { ...recurring, needsLiveInCare: true },
      }),
    ).toBe('Live-in caregiver for my mother in Austin, TX');
  });

  it('summarizes every-day, all-day, live-in care', () => {
    const { description } = generateJobText(
      {
        ...weekly,
        careFrequency: 'DAILY',
        recurring: {
          ...weekly.recurring!,
          hoursPerWeek: 60,
          needsLiveInCare: true,
          scheduleDays: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
            dayOfWeek,
            mode: 'ALL_DAY' as const,
            windows: [],
          })),
        },
      },
      mother,
    );

    expect(description).toContain(
      'Care is needed every day, all day (about 60 hours a week).',
    );
    expect(description).toContain('This is a live-in position.');
  });

  it('does not mention weekly hours for monthly care, nor unknown start / duration', () => {
    const { description } = generateJobText(
      {
        ...weekly,
        careFrequency: 'MONTHLY',
        recurring: {
          ...weekly.recurring!,
          careUrgency: 'EXPLORING',
          careDuration: 'NOT_SURE',
          scheduleDays: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
            dayOfWeek,
            mode: 'AVAILABLE_WINDOWS' as const,
            windows: [],
          })),
        },
      },
      mother,
    );

    expect(description).toContain(
      'Care is needed a few times a month on weekdays.',
    );
    expect(description).not.toContain('hours a week');
    expect(description).not.toContain('It should start');
    expect(description).not.toContain('will likely last');
  });
});

describe('generateJobText — one-time visits', () => {
  const father: JobTextContext = {
    ...mother,
    recipient: {
      ...mother.recipient!,
      gender: 'MALE',
      mobilityLevel: 'WHEELCHAIR',
    },
  };

  it('names the date, the tasks and the car', () => {
    expect(generateJobText(oneTime, father)).toEqual({
      title:
        'One-time visit on Aug 12: driving & companionship for my father in Austin, TX',
      description:
        'I am looking for a caregiver for a one-time visit to help my 82-year-old father in Austin, TX with driving and companionship. ' +
        'The visit is on Wednesday, August 12, from 10:00 AM to 1:30 PM. ' +
        'He uses a wheelchair and speaks Spanish and English. ' +
        'A female caregiver who speaks Spanish is preferred. ' +
        'The caregiver needs their own wheelchair-accessible car.',
    });
  });

  it('leaves out a visit date that has passed', () => {
    const { title, description } = generateJobText(
      {
        ...oneTime,
        careTasks: ['COMPANIONSHIP', 'LAUNDRY', 'SHOPPING_ERRANDS'],
        visit: { ...oneTime.visit!, date: new Date('2026-07-01T00:00:00Z') },
      },
      father,
    );

    expect(title).toBe('One-time care visit for my father in Austin, TX');
    expect(description).toContain('The visit is from 10:00 AM to 1:30 PM.');
    expect(description).not.toContain('July');
  });
});

describe('generateJobText — the person receiving care', () => {
  const title = (context: Partial<JobTextContext>) =>
    generateJobText(weekly, { ...mother, ...context }).title;
  const description = (context: Partial<JobTextContext>) =>
    generateJobText(weekly, { ...mother, ...context }).description;

  it('reads the relationship from the registrant’s side', () => {
    expect(title({ relationship: 'PARENT' })).toContain('for my daughter');
    expect(title({ relationship: 'SPOUSE_PARTNER' })).toContain('for my wife');
    expect(title({ relationship: 'GRANDCHILD' })).toContain(
      'for my grandmother',
    );
    expect(title({ relationship: 'FRIEND_NEIGHBOR' })).toContain(
      'for a friend',
    );
    expect(description({ relationship: 'OTHER_RELATIVE' })).toContain(
      'to help an 82-year-old relative',
    );
  });

  it('describes the person when the relationship says little', () => {
    expect(
      title({
        relationship: 'LEGAL_GUARDIAN',
        recipient: {
          ...mother.recipient!,
          gender: 'NON_BINARY',
          dateOfBirth: new Date('2018-01-01T00:00:00Z'),
        },
      }),
    ).toBe('Part-time caregiver for an 8-year-old child in Austin, TX');
    expect(
      description({
        relationship: 'PARENT',
        recipient: {
          ...mother.recipient!,
          gender: 'MALE',
          dateOfBirth: new Date('2026-02-01T00:00:00Z'),
        },
      }),
    ).toContain('to help my infant son');
  });

  it('uses "they" for non-binary / undisclosed genders', () => {
    expect(
      description({
        recipient: {
          ...mother.recipient!,
          gender: 'PREFER_NOT_TO_SAY',
          mobilityLevel: 'BEDBOUND',
          languagesSpoken: ['OTHER'],
          otherLanguage: 'Polish',
        },
      }),
    ).toContain('They are mostly in bed and speak Polish.');
  });

  it('writes in the first person for accounts registered for oneself', () => {
    const text = generateJobText(weekly, {
      ...mother,
      careFor: 'self',
      relationship: null,
      recipient: null,
    });
    expect(text.title).toBe('Part-time caregiver for me in Austin, TX');
    expect(text.description).toMatch(
      /^I am looking for a caregiver to help me/,
    );
  });
});

describe('generateJobText — always a valid post', () => {
  it('keeps titles within the limit, dropping the place first', () => {
    const { title } = generateJobText(weekly, {
      ...mother,
      city: 'A'.repeat(95),
    });
    expect(title).toBe('Part-time caregiver for my mother');
  });

  it('passes the job post length rules', () => {
    for (const details of [weekly, oneTime]) {
      const { title, description } = generateJobText(details, {
        ...mother,
        city: null,
        state: null,
        recipient: null,
      });
      expect(title.length).toBeGreaterThanOrEqual(JOB_TITLE_MIN_LENGTH);
      expect(title.length).toBeLessThanOrEqual(JOB_TITLE_MAX_LENGTH);
      expect(description.length).toBeGreaterThanOrEqual(
        JOB_DESCRIPTION_MIN_LENGTH,
      );
    }
  });
});

describe('text helpers', () => {
  it('joins lists in plain English', () => {
    expect(joinAnd([])).toBe('');
    expect(joinAnd(['a'])).toBe('a');
    expect(joinAnd(['a', 'b'])).toBe('a and b');
    expect(joinAnd(['a', 'b', 'c'])).toBe('a, b, and c');
  });

  it('picks "a" / "an" by sound', () => {
    expect(withArticle('82-year-old man')).toBe('an 82-year-old man');
    expect(withArticle('8-year-old child')).toBe('an 8-year-old child');
    expect(withArticle('11-year-old girl')).toBe('an 11-year-old girl');
    expect(withArticle('18-year-old man')).toBe('an 18-year-old man');
    expect(withArticle('infant')).toBe('an infant');
    expect(withArticle('7-year-old boy')).toBe('a 7-year-old boy');
    expect(withArticle('110-year-old woman')).toBe('a 110-year-old woman');
    expect(withArticle('friend')).toBe('a friend');
  });

  it('formats days and times', () => {
    expect(describeDays([])).toBeNull();
    expect(describeDays([0, 1, 2, 3, 4, 5, 6])).toBe('every day');
    expect(describeDays([5, 1, 2, 3, 4])).toBe('on weekdays');
    expect(describeDays([6, 0])).toBe('on weekends');
    expect(describeDays([0, 2, 4])).toBe('on Tuesdays, Thursdays, and Sundays');
    expect(formatClock('00:05')).toBe('12:05 AM');
    expect(formatClock('12:00')).toBe('12:00 PM');
    expect(formatClock('21:30')).toBe('9:30 PM');
  });
});
