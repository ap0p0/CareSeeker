import dayjs from "dayjs";
import { CARE_TASK_OPTIONS } from "../../utils/careOptions";
import type {
  CarePreferences,
  CarePreferencesPayload,
} from "./carePreferences";
import type { CareRecipient } from "./careRecipient";
import type {
  JobDetails,
  JobDraftResponse,
  JobText,
  JobTextPayload,
} from "./jobs";
import type { SeekerOnboardingStatus } from "./onboarding";
import { detailsFromPayload } from "./openJobsOverview";
import type { SeekerRegistrant } from "./registrant";

/**
 * The account of a demo session: Sarah Carter, who registered for her
 * father Walter (the first sample job is his). Used instead of the API for
 * everything the app reads about the account while in demo mode.
 */

const DEMO_PREFERENCES_PAYLOAD: CarePreferencesPayload = {
  careFrequency: "weekly",
  careTasks: [
    "mobility_transfers",
    "bathing_hygiene",
    "transportation_driving",
  ],
  recurring: {
    hoursPerWeek: 12,
    careDuration: "long_term",
    careUrgency: "asap",
    scheduleDays: [1, 3, 5].map((dayOfWeek) => ({
      dayOfWeek,
      mode: "available_windows" as const,
      windows: [{ start: "08:00", end: "12:00", endsNextDay: false }],
    })),
    needsLiveInCare: false,
    needsEmergencyCover: false,
  },
  scheduleFlexible: false,
  requiresWheelchairAccessibleVehicle: true,
  petsInHome: false,
  homeAccessibility: ["parking"],
  specialRequirements: "Uses a transfer board.",
  budget: { paymentType: "hourly", amountCents: 3200 },
  caregiverPreferences: {
    gender: "male",
    language: "english",
    requiredQualifications: ["hha"],
    minYearsExperience: 1,
    culturalConsiderations: null,
  },
};

const DEMO_RECIPIENT: CareRecipient = {
  name: "Walter",
  surname: "Carter",
  dateOfBirth: "1940-05-20",
  gender: "male",
  addressLine1: "42 Oak Lane",
  city: "Denver",
  state: "CO",
  postalCode: "80203",
  livingSituation: "with_spouse_partner",
  mobilityLevel: "wheelchair",
  languagesSpoken: ["english"],
  otherLanguage: null,
  ethnicBackground: "prefer_not_to_say",
  additionalInfo: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const DEMO_REGISTRANT: SeekerRegistrant = {
  name: "Sarah",
  surname: "Carter",
  email: "demo@careseeker.app",
  phone: "+15125550188",
  relationship: "child",
  relationshipOther: null,
  consentConfirmedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const demoPreferences = (): CarePreferences => ({
  ...detailsFromPayload(DEMO_PREFERENCES_PAYLOAD),
  updatedAt: "2026-01-01T00:00:00.000Z",
});

/** `GET /seeker/onboarding` of the demo account: registered and confirmed. */
export const demoOnboardingStatus = (): SeekerOnboardingStatus => ({
  careFor: "other",
  registrant: DEMO_REGISTRANT,
  careRecipient: DEMO_RECIPIENT,
  carePreferences: demoPreferences(),
  completedAt: "2026-01-01T00:00:00.000Z",
  profileConfirmedAt: "2026-01-01T00:00:00.000Z",
});

// ─── Title & description (demo) ──────────────────────────────────────────────

const joinAnd = (items: string[]): string =>
  items.length <= 2
    ? items.join(" and ")
    : `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;

const DAY_NAMES = [
  "Sundays",
  "Mondays",
  "Tuesdays",
  "Wednesdays",
  "Thursdays",
  "Fridays",
  "Saturdays",
];

/**
 * A title and short description for the demo. The real ones are written by
 * the API (`POST /seeker/jobs/draft/text`, `job-text.generator.ts`); this is
 * a compact version of the same templates so the demo needs no backend.
 */
export const demoJobText = (
  details: Pick<
    JobDetails,
    "careFrequency" | "careTasks" | "visit" | "recurring"
  >,
  location: { city: string; state: string },
): JobText => {
  const age = dayjs().diff(DEMO_RECIPIENT.dateOfBirth, "year");
  const place =
    location.city && location.state
      ? ` in ${location.city}, ${location.state}`
      : "";
  const tasks = details.careTasks.map(
    (task) =>
      CARE_TASK_OPTIONS.find((option) => option.value === task)
        ?.label.toLowerCase()
        .replace(" & ", " and ") ?? task,
  );
  const withTasks = tasks.length > 0 ? ` with ${joinAnd(tasks)}` : "";

  if (details.careFrequency === "one_time") {
    const visit = details.visit;
    return {
      title: `One-time care visit for my father${place}`,
      description: [
        `I am looking for a caregiver for a one-time visit to help my ${age}-year-old father${place}${withTasks}.`,
        visit
          ? `The visit is on ${dayjs(visit.date).format("dddd, MMMM D")}, from ${dayjs(`2000-01-01T${visit.startTime}`).format("h:mm A")} to ${dayjs(`2000-01-01T${visit.endTime}`).format("h:mm A")}.`
          : null,
        "He uses a wheelchair and speaks English.",
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  const recurring = details.recurring;
  const hours = recurring?.hoursPerWeek ?? null;
  const kind = recurring?.needsLiveInCare
    ? "Live-in caregiver"
    : details.careFrequency === "monthly"
      ? "Occasional caregiver"
      : hours !== null && hours >= 35
        ? "Full-time caregiver"
        : "Part-time caregiver";
  const days = recurring?.scheduleDays.map((day) => day.dayOfWeek) ?? [];
  const mondayFirst = [
    ...days.filter((day) => day !== 0).sort(),
    ...days.filter((day) => day === 0),
  ];
  const when =
    days.length === 7
      ? " every day"
      : days.length > 0
        ? ` on ${joinAnd(mondayFirst.map((day) => DAY_NAMES[day]))}`
        : "";

  return {
    title: `${kind} for my father${place}`,
    description: [
      `I am looking for a caregiver to help my ${age}-year-old father${place}${withTasks}.`,
      when || hours
        ? `Care is needed${when}${hours ? ` (about ${hours} hours a week)` : ""}.`
        : null,
      "He uses a wheelchair and speaks English.",
    ]
      .filter(Boolean)
      .join(" "),
  };
};

/** `GET /seeker/jobs/draft` of the demo account. */
export const demoJobDraft = (): JobDraftResponse => {
  const details = detailsFromPayload(DEMO_PREFERENCES_PAYLOAD);
  const location = {
    city: DEMO_RECIPIENT.city,
    state: DEMO_RECIPIENT.state,
    postalCode: DEMO_RECIPIENT.postalCode,
  };
  return {
    source: {
      careRecipientId: "demo-recipient",
      careRecipientName: DEMO_RECIPIENT.name,
    },
    draft: { ...demoJobText(details, location), ...location, details },
  };
};

/** `POST /seeker/jobs/draft/text` in the demo. */
export const demoJobTextFor = (payload: JobTextPayload): JobText =>
  demoJobText(detailsFromPayload(payload.details), payload);
