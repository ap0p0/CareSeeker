import {
  CareDuration,
  CareFrequency,
  CareTask,
  CareUrgency,
  DayAvailabilityMode,
  Gender,
  MobilityLevel,
  PreferredCaregiverGender,
  RegistrantRelationship,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import { calculateAge } from '../../common/personal-info.validation';
import type { JobDetails, JobText, JobTextContext } from './jobs.types';
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
} from './jobs.validation';

/**
 * Writes a job post title and a short description from the care details and
 * what is known about the person receiving care. Deterministic templates
 * (no external service): the same answers always give the same text, and
 * the seeker can edit both before posting.
 *
 * The text is meant to be read by caregivers, so it never contains the care
 * recipient's name or street address — only how they relate to the seeker,
 * their age, city and what matters for the job.
 */
export function generateJobText(
  details: JobDetails,
  context: JobTextContext,
): JobText {
  const person = describePerson(context);
  const place =
    context.city && context.state ? `${context.city}, ${context.state}` : null;

  return {
    title: buildTitle(details, context, person, place),
    description: buildDescription(details, context, person, place),
  };
}

// ─── The person receiving care ──────────────────────────────────────────────

type Pronoun = 'she' | 'he' | 'they';

type Person = {
  /** Short reference for titles: "my mother", "a friend", "an 82-year-old man". */
  short: string;
  /** With the age when known: "my 82-year-old mother". */
  long: string;
  pronoun: Pronoun;
};

type GenderedNoun = { female: string; male: string; neutral: string };

/**
 * How the care recipient relates to the registrant. `RegistrantRelationship`
 * is read from the registrant's side ("I am their child"), so `CHILD` means
 * the recipient is the registrant's parent.
 */
const RECIPIENT_NOUN: Partial<Record<RegistrantRelationship, GenderedNoun>> = {
  [RegistrantRelationship.CHILD]: {
    female: 'mother',
    male: 'father',
    neutral: 'parent',
  },
  [RegistrantRelationship.PARENT]: {
    female: 'daughter',
    male: 'son',
    neutral: 'child',
  },
  [RegistrantRelationship.SPOUSE_PARTNER]: {
    female: 'wife',
    male: 'husband',
    neutral: 'partner',
  },
  [RegistrantRelationship.SIBLING]: {
    female: 'sister',
    male: 'brother',
    neutral: 'sibling',
  },
  [RegistrantRelationship.GRANDCHILD]: {
    female: 'grandmother',
    male: 'grandfather',
    neutral: 'grandparent',
  },
  [RegistrantRelationship.GRANDPARENT]: {
    female: 'granddaughter',
    male: 'grandson',
    neutral: 'grandchild',
  },
};

/** Relationships that read better as "a friend" than "my friend". */
const INDEFINITE_NOUN: Partial<Record<RegistrantRelationship, string>> = {
  [RegistrantRelationship.OTHER_RELATIVE]: 'relative',
  [RegistrantRelationship.FRIEND_NEIGHBOR]: 'friend',
};

const pronounFor = (gender: Gender | undefined): Pronoun =>
  gender === Gender.FEMALE ? 'she' : gender === Gender.MALE ? 'he' : 'they';

const pick = (noun: GenderedNoun, pronoun: Pronoun): string =>
  pronoun === 'she' ? noun.female : pronoun === 'he' ? noun.male : noun.neutral;

/** "a" / "an" for the (spoken) start of `word`: "an 82-year-old", "an infant". */
export const withArticle = (word: string): string =>
  /^(8|11\b|11-|18\b|18-|[aeiou])/i.test(word) ? `an ${word}` : `a ${word}`;

/** "82-year-old", "infant" (under one). */
const ageAdjective = (age: number): string =>
  age < 1 ? 'infant' : `${age}-year-old`;

function describePerson(context: JobTextContext): Person {
  const { recipient, relationship } = context;
  if (context.careFor === 'self') {
    return { short: 'me', long: 'me', pronoun: 'they' };
  }
  if (!recipient) {
    return { short: 'a loved one', long: 'a loved one', pronoun: 'they' };
  }

  const pronoun = pronounFor(recipient.gender);
  const age = calculateAge(recipient.dateOfBirth, context.today);
  const validAge = age >= 0 && age <= 120 ? age : null;
  const withAge = (noun: string) =>
    validAge === null ? noun : `${ageAdjective(validAge)} ${noun}`;

  const relationNoun = relationship ? RECIPIENT_NOUN[relationship] : undefined;
  if (relationNoun) {
    const noun = pick(relationNoun, pronoun);
    return { short: `my ${noun}`, long: `my ${withAge(noun)}`, pronoun };
  }

  const indefiniteNoun = relationship
    ? INDEFINITE_NOUN[relationship]
    : undefined;
  if (indefiniteNoun) {
    return {
      short: withArticle(indefiniteNoun),
      long: withArticle(withAge(indefiniteNoun)),
      pronoun,
    };
  }

  // Legal guardian / other: describe the person instead of the relationship.
  const noun =
    validAge !== null && validAge < 1
      ? 'infant'
      : pick(
          validAge !== null && validAge < 18
            ? { female: 'girl', male: 'boy', neutral: 'child' }
            : { female: 'woman', male: 'man', neutral: 'person' },
          pronoun,
        );
  const described =
    noun === 'infant' ? withArticle(noun) : withArticle(withAge(noun));
  return { short: described, long: described, pronoun };
}

/** Verb forms that depend on the pronoun: ["needs", "need"]. */
const verb = (pronoun: Pronoun, forms: [string, string]): string =>
  pronoun === 'they' ? forms[1] : forms[0];

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

// ─── Vocabulary ──────────────────────────────────────────────────────────────

/** Task phrases for sentences ("help with …"). */
const TASK_PHRASE: Record<CareTask, string> = {
  [CareTask.BATHING_HYGIENE]: 'bathing and personal hygiene',
  [CareTask.TOILETING_INCONTINENCE_CARE]: 'toileting and incontinence care',
  [CareTask.DRESSING_GROOMING]: 'dressing and grooming',
  [CareTask.FEEDING_ASSISTANCE]: 'eating',
  [CareTask.MEAL_PREPARATION]: 'meal preparation',
  [CareTask.MEDICATION_REMINDERS]: 'medication reminders',
  [CareTask.MOBILITY_TRANSFERS]: 'moving around and transfers',
  [CareTask.HEAVY_LIFTING]: 'lifting',
  [CareTask.LIGHT_HOUSEKEEPING]: 'light housekeeping',
  [CareTask.LAUNDRY]: 'laundry',
  [CareTask.SHOPPING_ERRANDS]: 'shopping and errands',
  [CareTask.TRANSPORTATION_DRIVING]: 'driving',
  [CareTask.COMPANIONSHIP]: 'companionship',
  [CareTask.OVERNIGHT_CARE]: 'overnight care',
  [CareTask.PET_CARE]: 'pet care',
};

/** Short task names for titles. */
const TASK_TITLE: Record<CareTask, string> = {
  [CareTask.BATHING_HYGIENE]: 'bathing',
  [CareTask.TOILETING_INCONTINENCE_CARE]: 'toileting',
  [CareTask.DRESSING_GROOMING]: 'dressing',
  [CareTask.FEEDING_ASSISTANCE]: 'feeding',
  [CareTask.MEAL_PREPARATION]: 'meals',
  [CareTask.MEDICATION_REMINDERS]: 'medication reminders',
  [CareTask.MOBILITY_TRANSFERS]: 'mobility',
  [CareTask.HEAVY_LIFTING]: 'lifting',
  [CareTask.LIGHT_HOUSEKEEPING]: 'housekeeping',
  [CareTask.LAUNDRY]: 'laundry',
  [CareTask.SHOPPING_ERRANDS]: 'errands',
  [CareTask.TRANSPORTATION_DRIVING]: 'driving',
  [CareTask.COMPANIONSHIP]: 'companionship',
  [CareTask.OVERNIGHT_CARE]: 'overnight care',
  [CareTask.PET_CARE]: 'pet care',
};

const LANGUAGE_NAME: Record<SpokenLanguage, string | null> = {
  [SpokenLanguage.ENGLISH]: 'English',
  [SpokenLanguage.SPANISH]: 'Spanish',
  [SpokenLanguage.CHINESE]: 'Chinese',
  [SpokenLanguage.TAGALOG]: 'Tagalog',
  [SpokenLanguage.VIETNAMESE]: 'Vietnamese',
  [SpokenLanguage.ARABIC]: 'Arabic',
  [SpokenLanguage.FRENCH]: 'French',
  [SpokenLanguage.KOREAN]: 'Korean',
  [SpokenLanguage.RUSSIAN]: 'Russian',
  [SpokenLanguage.PORTUGUESE]: 'Portuguese',
  [SpokenLanguage.HINDI]: 'Hindi',
  // Uses the free text instead.
  [SpokenLanguage.OTHER]: null,
};

/** [she / he, they] */
const MOBILITY_PHRASE: Record<MobilityLevel, [string, string]> = {
  [MobilityLevel.INDEPENDENT]: [
    'gets around independently',
    'get around independently',
  ],
  [MobilityLevel.WALKING_AID]: [
    'walks with a cane or walker',
    'walk with a cane or walker',
  ],
  [MobilityLevel.NEEDS_ASSISTANCE]: [
    'needs help to walk and stand up',
    'need help to walk and stand up',
  ],
  [MobilityLevel.WHEELCHAIR]: ['uses a wheelchair', 'use a wheelchair'],
  [MobilityLevel.BEDBOUND]: ['is mostly in bed', 'are mostly in bed'],
};

const START_PHRASE: Record<CareUrgency, string | null> = {
  [CareUrgency.ASAP]: 'as soon as possible',
  [CareUrgency.WITHIN_A_WEEK]: 'within the next week',
  [CareUrgency.EXPLORING]: null,
};

const DURATION_PHRASE: Record<CareDuration, string | null> = {
  [CareDuration.SHORT_TERM]: 'less than a month',
  [CareDuration.MEDIUM_TERM]: 'one to six months',
  [CareDuration.LONG_TERM]: 'more than six months',
  [CareDuration.NOT_SURE]: null,
};

const CAREGIVER_GENDER: Record<PreferredCaregiverGender, string | null> = {
  [PreferredCaregiverGender.FEMALE]: 'female',
  [PreferredCaregiverGender.MALE]: 'male',
  [PreferredCaregiverGender.NO_PREFERENCE]: null,
};

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Formatting helpers ──────────────────────────────────────────────────────

/**
 * "a", "a and b", "a, b, and c". The serial comma matters here: task phrases
 * contain "and" themselves ("bathing and personal hygiene, and driving").
 */
export const joinAnd = (items: readonly string[]): string => {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

/** `HH:mm` → "9:30 AM". */
export const formatClock = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

/** UTC calendar day → "Wednesday, August 12" / "Aug 12". */
const formatDay = (date: Date, style: 'long' | 'short'): string =>
  style === 'long'
    ? `${WEEKDAYS[date.getUTCDay()]}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
    : `${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCDate()}`;

/**
 * Whether a visit day is still ahead (a day of slack for time zones behind
 * UTC, like the care-preferences validator). Past dates are left out of the
 * text; the form asks for a new date anyway.
 */
const isUpcoming = (date: Date, today: Date): boolean =>
  date.getTime() >=
  Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) -
    DAY_MS;

/** "every day", "on weekdays", "on weekends", "on Mondays and Thursdays". */
export function describeDays(dayNumbers: readonly number[]): string | null {
  const days = Array.from(new Set(dayNumbers)).sort((a, b) => a - b);
  if (days.length === 0) return null;
  if (days.length === 7) return 'every day';
  const key = days.join(',');
  if (key === '1,2,3,4,5') return 'on weekdays';
  if (key === '0,6') return 'on weekends';
  // Monday first, Sunday last.
  const mondayFirst = [
    ...days.filter((day) => day !== 0),
    ...days.filter((day) => day === 0),
  ];
  return `on ${joinAnd(mondayFirst.map((day) => `${WEEKDAYS[day]}s`))}`;
}

function taskList(tasks: readonly CareTask[]): string | null {
  if (tasks.length === 0) return null;
  const phrases = tasks.map((task) => TASK_PHRASE[task]);
  // Keep the description short: name a few, summarize the rest.
  return phrases.length > 5
    ? joinAnd([...phrases.slice(0, 4), 'other everyday tasks'])
    : joinAnd(phrases);
}

function languageList(context: JobTextContext): string | null {
  const recipient = context.recipient;
  if (!recipient) return null;
  const names = recipient.languagesSpoken
    .map((language) =>
      language === SpokenLanguage.OTHER
        ? recipient.otherLanguage?.trim() || null
        : LANGUAGE_NAME[language],
    )
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? joinAnd(names) : null;
}

/** Longest candidate that fits, or the last one cut at a word boundary. */
function fitTitle(candidates: string[]): string {
  const fitting = candidates.find(
    (candidate) => candidate.length <= JOB_TITLE_MAX_LENGTH,
  );
  if (fitting) return fitting;
  const last = candidates[candidates.length - 1];
  const cut = last.slice(0, JOB_TITLE_MAX_LENGTH - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

// ─── Title ───────────────────────────────────────────────────────────────────

/**
 * One-time: "One-time visit on Aug 12: driving & companionship for my mother
 * in Austin, TX". Recurring: "Part-time caregiver for my mother in
 * Austin, TX" (live-in / overnight / occasional / full-time / part-time).
 */
function buildTitle(
  details: JobDetails,
  context: JobTextContext,
  person: Person,
  place: string | null,
): string {
  const inPlace = place ? ` in ${place}` : '';

  if (details.careFrequency === CareFrequency.ONE_TIME) {
    const date =
      details.visit && isUpcoming(details.visit.date, context.today)
        ? ` on ${formatDay(details.visit.date, 'short')}`
        : '';
    const tasks =
      details.careTasks.length > 0 && details.careTasks.length <= 2
        ? details.careTasks.map((task) => TASK_TITLE[task]).join(' & ')
        : null;
    const lead = tasks
      ? `One-time visit${date}: ${tasks}`
      : `One-time care visit${date}`;
    const leadWithoutDate = tasks
      ? `One-time visit: ${tasks}`
      : 'One-time care visit';
    return fitTitle([
      `${lead} for ${person.short}${inPlace}`,
      `${lead} for ${person.short}`,
      `${leadWithoutDate} for ${person.short}`,
    ]);
  }

  const hours = details.recurring?.hoursPerWeek ?? null;
  const scheduleDays = details.recurring?.scheduleDays ?? [];
  // Only a job made of night shifts is an "overnight" job; a night here and
  // there is mentioned in the description instead.
  const onlyOvernight =
    scheduleDays.length > 0 &&
    scheduleDays.every(
      (day) =>
        day.windows.length > 0 &&
        day.windows.every((window) => window.endsNextDay),
    );
  const kind = details.recurring?.needsLiveInCare
    ? 'Live-in caregiver'
    : onlyOvernight
      ? 'Overnight caregiver'
      : details.careFrequency === CareFrequency.MONTHLY
        ? 'Occasional caregiver'
        : hours !== null && hours >= 35
          ? 'Full-time caregiver'
          : 'Part-time caregiver';

  return fitTitle([
    `${kind} for ${person.short}${inPlace}`,
    `${kind} for ${person.short}`,
  ]);
}

// ─── Description ─────────────────────────────────────────────────────────────

function scheduleSentences(
  details: JobDetails,
  context: JobTextContext,
): string[] {
  if (details.careFrequency === CareFrequency.ONE_TIME) {
    const visit = details.visit;
    if (!visit) return [];
    const day = isUpcoming(visit.date, context.today)
      ? ` on ${formatDay(visit.date, 'long')},`
      : '';
    const flexible = details.scheduleFlexible ? ' The time is flexible.' : '';
    return [
      `The visit is${day} from ${formatClock(visit.startTime)} to ${formatClock(visit.endTime)}.${flexible}`,
    ];
  }

  const recurring = details.recurring;
  if (!recurring) return [];

  const sentences: string[] = [];
  const allDays = recurring.scheduleDays.map((day) => day.dayOfWeek);
  const days = describeDays(allDays);
  const monthly =
    details.careFrequency === CareFrequency.MONTHLY
      ? ' a few times a month'
      : '';
  // Weekly hours would contradict "a few times a month".
  const hours =
    !monthly && recurring.hoursPerWeek
      ? ` (about ${recurring.hoursPerWeek} ${recurring.hoursPerWeek === 1 ? 'hour' : 'hours'} a week)`
      : '';
  const allDay =
    recurring.scheduleDays.length > 0 &&
    recurring.scheduleDays.every(
      (day) => day.mode === DayAvailabilityMode.ALL_DAY,
    )
      ? ', all day'
      : '';
  if (monthly || days || hours) {
    sentences.push(
      `Care is needed${monthly}${days ? ` ${days}` : ''}${allDay}${hours}.`,
    );
  }

  const start = recurring.careUrgency
    ? START_PHRASE[recurring.careUrgency]
    : null;
  const duration = recurring.careDuration
    ? DURATION_PHRASE[recurring.careDuration]
    : null;
  if (start && duration) {
    sentences.push(
      `It should start ${start} and will likely last ${duration}.`,
    );
  } else if (start) {
    sentences.push(`It should start ${start}.`);
  } else if (duration) {
    sentences.push(`It will likely last ${duration}.`);
  }

  if (recurring.needsLiveInCare) {
    sentences.push('This is a live-in position.');
  } else if (details.needsOvernightCare) {
    sentences.push('Some overnight care is needed.');
  }
  if (details.scheduleFlexible) {
    sentences.push('The schedule is flexible.');
  }

  return sentences;
}

function aboutPersonSentence(
  context: JobTextContext,
  person: Person,
): string | null {
  const mobilityLevel = context.recipient?.mobilityLevel ?? null;
  const mobility = mobilityLevel
    ? verb(person.pronoun, MOBILITY_PHRASE[mobilityLevel])
    : null;
  const languages = languageList(context);
  const speaks = languages
    ? `${verb(person.pronoun, ['speaks', 'speak'])} ${languages}`
    : null;
  const parts = [mobility, speaks].filter((part): part is string =>
    Boolean(part),
  );
  return parts.length > 0
    ? `${capitalize(person.pronoun)} ${joinAnd(parts)}.`
    : null;
}

function caregiverSentences(details: JobDetails): string[] {
  const sentences: string[] = [];
  const preferences = details.caregiverPreferences;

  const gender = preferences.gender
    ? CAREGIVER_GENDER[preferences.gender]
    : null;
  const language = preferences.language
    ? LANGUAGE_NAME[preferences.language]
    : null;
  if (gender || language) {
    sentences.push(
      `${capitalize(withArticle(gender ? `${gender} caregiver` : 'caregiver'))}${
        language ? ` who speaks ${language}` : ''
      } is preferred.`,
    );
  }

  if (details.requiresCaregiverVehicle) {
    sentences.push(
      details.requiresWheelchairAccessibleVehicle
        ? 'The caregiver needs their own wheelchair-accessible car.'
        : 'The caregiver needs their own car.',
    );
  }

  return sentences;
}

/**
 * A few sentences: who needs care, where and with what; when; a word about
 * the person; what kind of caregiver is preferred. Budget, qualifications,
 * home details etc. are shown with the job's structured details.
 */
function buildDescription(
  details: JobDetails,
  context: JobTextContext,
  person: Person,
  place: string | null,
): string {
  const tasks = taskList(details.careTasks);
  const visit =
    details.careFrequency === CareFrequency.ONE_TIME
      ? ' for a one-time visit'
      : '';
  const intro = `I am looking for a caregiver${visit} to help ${person.long}${
    place ? ` in ${place}` : ''
  }${tasks ? ` with ${tasks}` : ''}.`;

  const sentences = [
    intro,
    ...scheduleSentences(details, context),
    aboutPersonSentence(context, person),
    ...caregiverSentences(details),
  ].filter((sentence): sentence is string => Boolean(sentence));

  // Whole sentences only, within the limit (far above what the templates
  // produce; this only guards against very long free-text languages).
  let description = '';
  for (const sentence of sentences) {
    const next = description ? `${description} ${sentence}` : sentence;
    if (next.length > JOB_DESCRIPTION_MAX_LENGTH) break;
    description = next;
  }
  return description;
}
