import type { CareTask, SpokenLanguage } from "../../utils/careOptions";
import type {
  CareDuration,
  CarePreferencesPayload,
  PaymentType,
} from "./carePreferences";
import {
  canEditJob,
  canPauseJob,
  canResumeJob,
  jobClosurePolicy,
  type JobClosureReason,
} from "./jobPolicies";
import type { CreateJobPayload, Job, JobDetails } from "./jobs";

/**
 * The job screens' model (`ClientJobOverview`) and the **sample data** of
 * demo sessions ("Explore with sample data"), with a sample service that
 * behaves like the API (`jobsService` picks it in a demo; real jobs come
 * from `jobsApi.ts`). Applicants, AI recommendations, interviews, hiring,
 * payments and closure approval only exist here so far. A job carries the
 * same post fields as the API's job (`title`, `description`, `city` /
 * `state` / `postalCode`, `details`) plus what the overview needs; real
 * jobs are mapped to it by `overviewFromJob`.
 *
 * The mock keeps its jobs in `localStorage` (see `jobsStore`): job links
 * work across tabs and reloads, and edits / closures / closure requests
 * stay until the sample data is re-seeded the next day.
 */

/**
 * Where a job post is, from the seeker's point of view. Finer than the
 * API's `JobStatus` (OPEN / IN_PROGRESS / COMPLETED / CANCELLED).
 */
export type JobPostStatus =
  /** Posted; caregivers can apply and the AI suggests matches. */
  | "open"
  /** The seeker is talking to one or more candidates. */
  | "interviewing"
  /** An offer went out; waiting for the caregiver to accept. */
  | "offer_sent"
  /** A caregiver accepted and is working on the job. */
  | "hired"
  /** Temporarily hidden from caregivers by the seeker. */
  | "paused"
  /** Finished — never shown on the open jobs page. */
  | "completed"
  | "cancelled"
  /** Closed by the seeker and moved to the archive. */
  | "closed";

export const FINISHED_JOB_STATUSES: readonly JobPostStatus[] = [
  "completed",
  "cancelled",
  "closed",
];

export const isFinishedJob = (job: { status: JobPostStatus }): boolean =>
  FINISHED_JOB_STATUSES.includes(job.status);

/** The hiring funnel of a job (counts). */
export type JobPipeline = {
  /** Caregivers our AI matched to the job. */
  recommended: number;
  /** Caregivers who applied. */
  applied: number;
  /** Applications the seeker has not looked at yet (part of `applied`). */
  newApplicants: number;
  /** Candidates currently in an interview. */
  interviewing: number;
};

export type HiredCaregiver = {
  name: string;
  /** 0–5, `null` while they have no reviews. */
  rating: number | null;
  /** `YYYY-MM-DD` */
  startedOn: string;
  /** ISO date-time of the next scheduled visit, if any. */
  nextVisitAt: string | null;
};

/**
 * What the seeker owes for a hired job.
 * - hourly: hours logged in the current billing week; `accruing` while the
 *   week runs, then an invoice that is `due` / `overdue` / `paid`.
 * - fixed price: one amount for the job / visit, `due` / `overdue` / `paid`.
 */
export type JobBilling =
  | {
      paymentType: "hourly";
      rateCents: number;
      /** Billable hours of the current (or invoiced) week. */
      hours: number;
      /** `YYYY-MM-DD` first and last day of that week. */
      periodStart: string;
      periodEnd: string;
      state: "accruing" | "due" | "overdue" | "paid";
      /** Invoice date (accruing) or payment due date (due / overdue). */
      dueOn: string | null;
      paidOn: string | null;
    }
  | {
      paymentType: "fixed_price";
      amountCents: number;
      state: "due" | "overdue" | "paid";
      dueOn: string | null;
      paidOn: string | null;
    };

/** A request to close a job that is past the "open" stage. */
export type JobClosureRequest = {
  reason: JobClosureReason;
  explanation: string;
  /** ISO date-time */
  requestedAt: string;
  /** Admins approve (the job is closed) or decline (it keeps running). */
  state: "pending" | "approved" | "declined";
};

export type ClientJobOverview = {
  /**
   * Public job id — what links (`/jobs/<jobId>`) and single-job lookups
   * use. Same format as the API's `jobs.jobId` (16 lowercase hex
   * characters); generated when the job is created.
   */
  jobId: string;
  /** Internal key (the API's primary key); never used in links. */
  id: string;
  status: JobPostStatus;
  // The post itself — same fields as the API's job.
  title: string;
  description: string;
  city: string;
  state: string;
  postalCode: string;
  details: JobDetails;
  // Overview.
  /** ISO date-time */
  postedAt: string;
  pipeline: JobPipeline;
  unreadMessages: number;
  /** `offer_sent` only. */
  offer: { caregiverName: string; sentAt: string; expiresAt: string } | null;
  /** `hired` only. */
  caregiver: HiredCaregiver | null;
  billing: JobBilling | null;
  /** `paused` only (ISO date-time). */
  pausedAt: string | null;
  /** Last time the seeker edited the post (ISO date-time). */
  editedAt: string | null;
  closureRequest: JobClosureRequest | null;
  /** `closed` only (ISO date-time). */
  closedAt: string | null;
};

// ─── Details (payload → saved shape) ─────────────────────────────────────────

/**
 * A care-details payload as the API would store it, including the flags
 * the API derives (car from the driving task, overnight from the task or
 * hours ending the next day, pets from pet care). Mock only — the real API
 * does this in `care-preferences.validation.ts`.
 */
export const detailsFromPayload = (
  payload: CarePreferencesPayload,
): JobDetails => {
  const driving = payload.careTasks.includes("transportation_driving");
  const recurring = payload.recurring ?? null;

  return {
    careFrequency: payload.careFrequency,
    careTasks: [...payload.careTasks],
    visit:
      payload.careFrequency === "one_time" ? (payload.visit ?? null) : null,
    recurring:
      payload.careFrequency === "one_time" || !recurring
        ? null
        : {
            ...recurring,
            scheduleDays: recurring.scheduleDays.map((day) => ({
              ...day,
              windows: day.windows.map((window) => ({ ...window })),
            })),
          },
    scheduleFlexible: payload.scheduleFlexible,
    needsOvernightCare:
      payload.careTasks.includes("overnight_care") ||
      Boolean(
        recurring?.scheduleDays.some((day) =>
          day.windows.some((window) => window.endsNextDay),
        ),
      ),
    requiresCaregiverVehicle: driving,
    requiresWheelchairAccessibleVehicle:
      driving && payload.requiresWheelchairAccessibleVehicle,
    petsInHome: payload.petsInHome || payload.careTasks.includes("pet_care"),
    homeAccessibility: [...payload.homeAccessibility],
    specialRequirements: payload.specialRequirements,
    budget: { ...payload.budget },
    caregiverPreferences: {
      ...payload.caregiverPreferences,
      requiredQualifications: [
        ...payload.caregiverPreferences.requiredQualifications,
      ],
    },
  };
};

// ─── Job ids ─────────────────────────────────────────────────────────────────

/** The API's `jobs.jobId` format: 16 lowercase hex characters. */
export const JOB_ID_PATTERN = /^[0-9a-f]{16}$/;

export const isJobId = (value: string): boolean => JOB_ID_PATTERN.test(value);

/** 32-bit FNV-1a, as 8 hex characters. */
const fnv1aHex = (text: string): string => {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).padStart(8, "0");
};

const randomHex = (bytes: number): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

/**
 * Public ids of the sample jobs. Real jobs get theirs from the database;
 * the mock derives them from a random salt made once per browser, so they
 * look like real ids, differ between browsers, and stay the same across
 * tabs, reloads and the daily re-seed (links keep working).
 */
const SALT_KEY = "careseeker.mock.jobIdSalt";

const mockJobIdSalt = (): string => {
  try {
    const stored = localStorage.getItem(SALT_KEY);
    if (stored) return stored;
    const salt = randomHex(16);
    localStorage.setItem(SALT_KEY, salt);
    return salt;
  } catch {
    return "careseeker";
  }
};

const mockJobId = (salt: string, key: string): string =>
  `${fnv1aHex(`${salt}:${key}`)}${fnv1aHex(`${key}:${salt}`)}`;

// ─── Mock data ───────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DAY_MS = 24 * 60 * 60 * 1000;
/** ISO date-time `days` from now (negative = past), so the mock never ages. */
const fromNow = (days: number, hour = 9): string => {
  const date = new Date(Date.now() + days * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
/** `YYYY-MM-DD` `days` from today. */
const dayFromNow = (days: number): string => {
  const date = new Date(Date.now() + days * DAY_MS);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

type CommonSpec = {
  tasks: CareTask[];
  paymentType: PaymentType;
  amountCents: number | null;
  caregiverGender?: "female" | "male" | "no_preference";
  caregiverLanguage?: SpokenLanguage | null;
  specialRequirements?: string | null;
};

const commonPayload = (spec: CommonSpec) => ({
  careTasks: spec.tasks,
  scheduleFlexible: false,
  requiresWheelchairAccessibleVehicle: false,
  petsInHome: false,
  homeAccessibility: [],
  specialRequirements: spec.specialRequirements ?? null,
  budget: { paymentType: spec.paymentType, amountCents: spec.amountCents },
  caregiverPreferences: {
    gender: spec.caregiverGender ?? "no_preference",
    language: spec.caregiverLanguage ?? null,
    requiredQualifications: [],
    minYearsExperience: null,
    culturalConsiderations: null,
  },
});

const recurringDetails = (
  spec: CommonSpec & {
    frequency: "daily" | "weekly" | "monthly";
    hoursPerWeek: number;
    days: number[];
    /** Same-day hours, or all day when omitted. */
    hours?: { start: string; end: string; endsNextDay?: boolean };
    liveIn?: boolean;
    duration?: CareDuration;
  },
): JobDetails =>
  detailsFromPayload({
    ...commonPayload(spec),
    careFrequency: spec.frequency,
    recurring: {
      hoursPerWeek: spec.hoursPerWeek,
      careDuration: spec.duration ?? "long_term",
      careUrgency: "asap",
      scheduleDays: spec.days.map((dayOfWeek) => ({
        dayOfWeek,
        mode: spec.hours ? "available_windows" : "all_day",
        windows: spec.hours
          ? [
              {
                start: spec.hours.start,
                end: spec.hours.end,
                endsNextDay: spec.hours.endsNextDay ?? false,
              },
            ]
          : [],
      })),
      needsLiveInCare: spec.liveIn ?? false,
      needsEmergencyCover: false,
    },
  });

const oneTimeDetails = (
  spec: CommonSpec & { date: string; startTime: string; endTime: string },
): JobDetails =>
  detailsFromPayload({
    ...commonPayload(spec),
    careFrequency: "one_time",
    visit: {
      date: spec.date,
      startTime: spec.startTime,
      endTime: spec.endTime,
      notes: null,
    },
  });

const noPipeline: JobPipeline = {
  recommended: 0,
  applied: 0,
  newApplicants: 0,
  interviewing: 0,
};

const base = {
  city: "Denver",
  state: "CO",
  postalCode: "80203",
  unreadMessages: 0,
  offer: null,
  caregiver: null,
  billing: null,
  pausedAt: null,
  editedAt: null,
  closureRequest: null,
  closedAt: null,
} as const;

type MockJobSeed = Omit<ClientJobOverview, "jobId">;

/** One job per state worth seeing, plus finished ones (never listed). */
const mockJobSeeds = (): MockJobSeed[] => [
  {
    ...base,
    id: "job-open-applicants",
    title: "Part-time caregiver for my father in Denver, CO",
    description:
      "I am looking for a caregiver to help my 86-year-old father with moving around and transfers, bathing and personal hygiene, and driving. Care is needed on Mondays, Wednesdays, and Fridays (about 12 hours a week).",
    status: "open",
    details: recurringDetails({
      frequency: "weekly",
      tasks: [
        "mobility_transfers",
        "bathing_hygiene",
        "transportation_driving",
      ],
      hoursPerWeek: 12,
      days: [1, 3, 5],
      hours: { start: "08:00", end: "12:00" },
      paymentType: "hourly",
      amountCents: 3200,
      caregiverGender: "male",
      caregiverLanguage: "english",
    }),
    postedAt: fromNow(-2),
    pipeline: {
      recommended: 12,
      applied: 5,
      newApplicants: 3,
      interviewing: 0,
    },
    unreadMessages: 2,
  },
  {
    ...base,
    id: "job-open-fresh",
    title: "One-time visit: driving & companionship for my father",
    description:
      "I am looking for a caregiver for a one-time visit to drive my father to his eye doctor and keep him company. He uses a wheelchair, so a wheelchair-accessible car is needed.",
    status: "open",
    details: oneTimeDetails({
      tasks: ["transportation_driving", "companionship"],
      date: dayFromNow(9),
      startTime: "09:30",
      endTime: "11:30",
      paymentType: "fixed_price",
      amountCents: 12000,
    }),
    postedAt: fromNow(0, 8),
    pipeline: { recommended: 4, applied: 0, newApplicants: 0, interviewing: 0 },
  },
  {
    ...base,
    id: "job-interviewing",
    title: "Live-in caregiver for my mother in Aurora, CO",
    description:
      "Live-in help for my 79-year-old mother after her hip surgery: meals, medication reminders, light housekeeping and company. She speaks Spanish and English.",
    status: "interviewing",
    city: "Aurora",
    postalCode: "80012",
    details: recurringDetails({
      frequency: "daily",
      tasks: [
        "meal_preparation",
        "medication_reminders",
        "light_housekeeping",
        "companionship",
      ],
      hoursPerWeek: 60,
      days: [0, 1, 2, 3, 4, 5, 6],
      liveIn: true,
      duration: "medium_term",
      paymentType: "hourly",
      amountCents: 2800,
      caregiverGender: "female",
      caregiverLanguage: "spanish",
    }),
    postedAt: fromNow(-6),
    pipeline: {
      recommended: 9,
      applied: 14,
      newApplicants: 1,
      interviewing: 3,
    },
    unreadMessages: 4,
  },
  {
    ...base,
    id: "job-offer",
    title: "Overnight caregiver for my grandmother",
    description:
      "Overnight care three nights a week for my grandmother, who has early-stage dementia: help to the bathroom, reassurance, and a calm presence until morning.",
    status: "offer_sent",
    city: "Lakewood",
    postalCode: "80226",
    details: recurringDetails({
      frequency: "weekly",
      tasks: ["overnight_care", "toileting_incontinence_care", "companionship"],
      hoursPerWeek: 30,
      days: [5, 6, 0],
      hours: { start: "21:00", end: "07:00", endsNextDay: true },
      paymentType: "hourly",
      amountCents: 3000,
    }),
    postedAt: fromNow(-10),
    pipeline: { recommended: 7, applied: 8, newApplicants: 0, interviewing: 2 },
    offer: {
      caregiverName: "Maria Gomez",
      sentAt: fromNow(-1, 15),
      expiresAt: fromNow(2, 18),
    },
  },
  {
    ...base,
    id: "job-hired-accruing",
    title: "Part-time caregiver for my wife in Boulder, CO",
    description:
      "Help at home for my wife on weekday mornings: getting ready for the day, breakfast, her exercises and a short walk.",
    status: "hired",
    city: "Boulder",
    postalCode: "80302",
    details: recurringDetails({
      frequency: "weekly",
      tasks: ["dressing_grooming", "meal_preparation", "mobility_transfers"],
      hoursPerWeek: 15,
      days: [1, 2, 3, 4, 5],
      hours: { start: "08:00", end: "11:00" },
      paymentType: "hourly",
      amountCents: 3200,
    }),
    postedAt: fromNow(-34),
    pipeline: { ...noPipeline, recommended: 10, applied: 9 },
    unreadMessages: 1,
    caregiver: {
      name: "Daniel Okafor",
      rating: 4.9,
      startedOn: dayFromNow(-21),
      nextVisitAt: fromNow(1, 8),
    },
    billing: {
      paymentType: "hourly",
      rateCents: 3200,
      hours: 12.5,
      periodStart: dayFromNow(-3),
      periodEnd: dayFromNow(3),
      state: "accruing",
      dueOn: dayFromNow(4),
      paidOn: null,
    },
  },
  {
    ...base,
    id: "job-hired-overdue",
    title: "Weekend companion for my brother",
    description:
      "Company and outings on weekends for my brother, who lives with a mild intellectual disability: cooking together, errands and a walk in the park.",
    status: "hired",
    details: recurringDetails({
      frequency: "weekly",
      tasks: ["companionship", "shopping_errands", "meal_preparation"],
      hoursPerWeek: 8,
      days: [6, 0],
      hours: { start: "10:00", end: "14:00" },
      paymentType: "hourly",
      amountCents: 2500,
    }),
    postedAt: fromNow(-45),
    pipeline: { ...noPipeline, recommended: 6, applied: 4 },
    caregiver: {
      name: "Aisha Rahman",
      rating: 4.7,
      startedOn: dayFromNow(-38),
      nextVisitAt: fromNow(3, 10),
    },
    billing: {
      paymentType: "hourly",
      rateCents: 2500,
      hours: 8,
      periodStart: dayFromNow(-12),
      periodEnd: dayFromNow(-6),
      state: "overdue",
      dueOn: dayFromNow(-2),
      paidOn: null,
    },
  },
  {
    ...base,
    id: "job-hired-fixed-due",
    title: "One-time visit: help after a hospital discharge",
    description:
      "Someone to be with my mother on the day she comes home from the hospital: settle her in, prepare a meal and make sure her medication is organized.",
    status: "hired",
    details: oneTimeDetails({
      tasks: ["meal_preparation", "medication_reminders", "companionship"],
      date: dayFromNow(-1),
      startTime: "10:00",
      endTime: "15:00",
      paymentType: "fixed_price",
      amountCents: 18000,
    }),
    postedAt: fromNow(-8),
    pipeline: { ...noPipeline, recommended: 5, applied: 6 },
    caregiver: {
      name: "Grace Kim",
      rating: null,
      startedOn: dayFromNow(-1),
      nextVisitAt: null,
    },
    billing: {
      paymentType: "fixed_price",
      amountCents: 18000,
      state: "due",
      dueOn: dayFromNow(2),
      paidOn: null,
    },
  },
  {
    ...base,
    id: "job-hired-fixed-paid",
    title: "Monthly check-in visits for my aunt",
    description:
      "Two visits a month for my aunt: a chat over coffee, a look at the fridge and the mail, and a short report to me afterwards.",
    status: "hired",
    city: "Littleton",
    postalCode: "80120",
    details: recurringDetails({
      frequency: "monthly",
      tasks: ["companionship", "light_housekeeping"],
      hoursPerWeek: 2,
      days: [4],
      hours: { start: "14:00", end: "16:00" },
      paymentType: "fixed_price",
      amountCents: 9000,
    }),
    postedAt: fromNow(-60),
    pipeline: { ...noPipeline, recommended: 3, applied: 2 },
    caregiver: {
      name: "Helen Parker",
      rating: 5,
      startedOn: dayFromNow(-50),
      nextVisitAt: fromNow(11, 14),
    },
    billing: {
      paymentType: "fixed_price",
      amountCents: 9000,
      state: "paid",
      dueOn: null,
      paidOn: dayFromNow(-4),
    },
  },
  {
    ...base,
    id: "job-hired-no-hours",
    title: "After-school care for my son",
    description:
      "Pick-up from school, a snack, homework help and play until I get home. He is 9 and loves board games and soccer.",
    status: "hired",
    details: recurringDetails({
      frequency: "weekly",
      tasks: ["transportation_driving", "meal_preparation", "companionship"],
      hoursPerWeek: 10,
      days: [1, 2, 3, 4, 5],
      hours: { start: "15:00", end: "17:00" },
      paymentType: "hourly",
      amountCents: 2200,
    }),
    postedAt: fromNow(-9),
    pipeline: { ...noPipeline, recommended: 15, applied: 11 },
    caregiver: {
      name: "Lucas Moreau",
      rating: 4.8,
      startedOn: dayFromNow(0),
      nextVisitAt: fromNow(0, 15),
    },
    billing: {
      paymentType: "hourly",
      rateCents: 2200,
      hours: 0,
      periodStart: dayFromNow(0),
      periodEnd: dayFromNow(6),
      state: "accruing",
      dueOn: dayFromNow(7),
      paidOn: null,
    },
  },
  {
    ...base,
    id: "job-paused",
    title: "Help with errands and housekeeping",
    description:
      "A few hours every other week for groceries, laundry and tidying up for my father while I travel for work.",
    status: "paused",
    details: recurringDetails({
      frequency: "monthly",
      tasks: ["shopping_errands", "laundry", "light_housekeeping"],
      hoursPerWeek: 4,
      days: [2],
      hours: { start: "09:00", end: "13:00" },
      paymentType: "hourly",
      amountCents: null,
    }),
    postedAt: fromNow(-20),
    pipeline: { recommended: 6, applied: 3, newApplicants: 0, interviewing: 0 },
    pausedAt: fromNow(-5),
  },
  // Finished jobs: part of the data, never shown on the open jobs page.
  {
    ...base,
    id: "job-completed",
    title: "Respite care while I was away",
    description: "Two weeks of daily visits in October.",
    status: "completed",
    details: recurringDetails({
      frequency: "daily",
      tasks: ["companionship", "meal_preparation"],
      hoursPerWeek: 20,
      days: [0, 1, 2, 3, 4, 5, 6],
      paymentType: "hourly",
      amountCents: 3000,
    }),
    postedAt: fromNow(-70),
    pipeline: noPipeline,
  },
  {
    ...base,
    id: "job-cancelled",
    title: "Driver for a dentist appointment",
    description: "No longer needed.",
    status: "cancelled",
    details: oneTimeDetails({
      tasks: ["transportation_driving"],
      date: dayFromNow(-15),
      startTime: "13:00",
      endTime: "15:00",
      paymentType: "fixed_price",
      amountCents: 6000,
    }),
    postedAt: fromNow(-25),
    pipeline: noPipeline,
  },
];

// ─── Mock service ────────────────────────────────────────────────────────────

/**
 * The mock jobs live in `localStorage`, so edits, closures and closure
 * requests survive reloads and job links work in any tab. The sample data
 * is re-seeded once a day so its relative dates ("posted 2 days ago",
 * "next visit tomorrow") stay believable; job ids stay the same.
 */
const STORAGE_KEY = "careseeker.mock.clientJobs.v3";

type StoredJobs = { seededOn: string; jobs: ClientJobOverview[] };

const today = () => new Date().toDateString();

/** Seeds the sample jobs, each with a freshly generated public `jobId`. */
const buildMockJobs = (): ClientJobOverview[] => {
  const salt = mockJobIdSalt();
  return mockJobSeeds().map((job) => ({
    ...job,
    jobId: mockJobId(salt, job.id),
  }));
};
let mockJobs: ClientJobOverview[] | null = null;

/** Today's stored jobs; `null` when none or seeded on another day. */
const loadStoredJobs = (): ClientJobOverview[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as StoredJobs) : null;
    return stored?.seededOn === today() ? stored.jobs : null;
  } catch {
    return null;
  }
};

const storeJobs = (jobs: ClientJobOverview[]) => {
  try {
    const stored: StoredJobs = { seededOn: today(), jobs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable (private mode, quota): keep them in memory only.
  }
};

const jobsStore = (): ClientJobOverview[] => {
  if (!mockJobs) {
    mockJobs = loadStoredJobs();
    if (!mockJobs) {
      // Save the seed right away, so every tab works on the same jobs.
      mockJobs = buildMockJobs();
      storeJobs(mockJobs);
    }
  }
  return mockJobs;
};

export type ClientJobErrorCode =
  | "JOB_NOT_FOUND"
  | "JOB_NOT_EDITABLE"
  | "JOB_NOT_CLOSABLE"
  | "CLOSURE_NEEDS_APPROVAL"
  | "CLOSURE_NOT_NEEDED"
  | "JOB_NOT_PAUSABLE"
  | "JOB_NOT_PAUSED";

export class ClientJobError extends Error {
  code: ClientJobErrorCode;

  constructor(code: ClientJobErrorCode, message: string) {
    super(message);
    this.name = "ClientJobError";
    this.code = code;
  }
}

const findJob = (jobId: string): ClientJobOverview => {
  const job = jobsStore().find((item) => item.jobId === jobId);
  if (!job) {
    throw new ClientJobError("JOB_NOT_FOUND", "This job does not exist.");
  }
  return job;
};

const replaceJob = (next: ClientJobOverview): ClientJobOverview => {
  mockJobs = jobsStore().map((job) => (job.jobId === next.jobId ? next : job));
  storeJobs(mockJobs);
  return next;
};

/**
 * The seeker's open jobs (in a curated order that shows every state),
 * **without finished jobs** (like `GET /seeker/jobs`, which only returns
 * open / in-progress jobs). `empty: true` previews the page without jobs.
 */
export const fetchMockClientOpenJobs = async ({
  empty = false,
}: { empty?: boolean } = {}): Promise<ClientJobOverview[]> => {
  await delay(400);
  if (empty) return [];
  return jobsStore().filter((job) => !isFinishedJob(job));
};

/**
 * One job by its public `jobId` (finished ones included); `null` when it
 * does not exist or the id is malformed.
 */
export const fetchMockClientJob = async (
  jobId: string,
): Promise<ClientJobOverview | null> => {
  await delay(250);
  if (!isJobId(jobId)) return null;
  return jobsStore().find((job) => job.jobId === jobId) ?? null;
};

/** The API's shape of a job, for flows shared with real jobs. */
export const mockJobAsApiJob = (job: ClientJobOverview): Job => ({
  jobId: job.jobId,
  status:
    job.status === "interviewing" || job.status === "offer_sent"
      ? "open"
      : job.status === "hired"
        ? "in_progress"
        : job.status,
  title: job.title,
  description: job.description,
  careRecipientId: null,
  details: job.details,
  city: job.city,
  state: job.state,
  postalCode: job.postalCode,
  createdAt: job.postedAt,
  updatedAt: job.editedAt ?? job.postedAt,
  editedAt: job.editedAt,
  pausedAt: job.pausedAt,
  closedAt: job.closedAt,
});

/**
 * Posts a job in the sample data (demo mode): an open job without
 * applicants yet, listed first, with a new random public id.
 */
export const createMockClientJob = async (
  payload: CreateJobPayload,
): Promise<Job> => {
  await delay(500);
  const now = new Date().toISOString();
  const job: ClientJobOverview = {
    jobId: randomHex(8),
    id: `job-created-${randomHex(4)}`,
    status: "open",
    title: payload.title,
    description: payload.description,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    details: detailsFromPayload(payload.details),
    postedAt: now,
    pipeline: { recommended: 0, applied: 0, newApplicants: 0, interviewing: 0 },
    unreadMessages: 0,
    offer: null,
    caregiver: null,
    billing: null,
    pausedAt: null,
    editedAt: null,
    closureRequest: null,
    closedAt: null,
  };
  mockJobs = [job, ...jobsStore()];
  storeJobs(mockJobs);
  return mockJobAsApiJob(job);
};

/** Saves an edited post. Only open jobs can be edited (`jobPolicies`). */
export const updateMockClientJob = async (
  jobId: string,
  payload: CreateJobPayload,
): Promise<ClientJobOverview> => {
  await delay(500);
  const job = findJob(jobId);
  if (!canEditJob(job)) {
    throw new ClientJobError(
      "JOB_NOT_EDITABLE",
      "Only open jobs can be edited.",
    );
  }
  return replaceJob({
    ...job,
    title: payload.title,
    description: payload.description,
    city: payload.city,
    state: payload.state,
    postalCode: payload.postalCode,
    details: detailsFromPayload(payload.details),
    editedAt: new Date().toISOString(),
  });
};

/** Hides an open job from caregivers (`jobPolicies.canPauseJob`). */
export const pauseMockClientJob = async (
  jobId: string,
): Promise<ClientJobOverview> => {
  await delay(400);
  const job = findJob(jobId);
  if (!canPauseJob(job)) {
    throw new ClientJobError(
      "JOB_NOT_PAUSABLE",
      "Only open jobs can be paused.",
    );
  }
  return replaceJob({
    ...job,
    status: "paused",
    pausedAt: new Date().toISOString(),
  });
};

/** Makes a paused job open again. */
export const resumeMockClientJob = async (
  jobId: string,
): Promise<ClientJobOverview> => {
  await delay(400);
  const job = findJob(jobId);
  if (!canResumeJob(job)) {
    throw new ClientJobError("JOB_NOT_PAUSED", "This job is not paused.");
  }
  return replaceJob({ ...job, status: "open", pausedAt: null });
};

/** Closes an open job right away: it moves to the archive. */
export const closeMockClientJob = async (
  jobId: string,
): Promise<ClientJobOverview> => {
  await delay(500);
  const job = findJob(jobId);
  const policy = jobClosurePolicy(job);
  if (policy === "request_approval") {
    throw new ClientJobError(
      "CLOSURE_NEEDS_APPROVAL",
      "This job can only be closed with a reason and an admin's approval.",
    );
  }
  if (policy !== "close_now") {
    throw new ClientJobError(
      "JOB_NOT_CLOSABLE",
      "This job cannot be closed right now.",
    );
  }
  return replaceJob({
    ...job,
    status: "closed",
    closedAt: new Date().toISOString(),
  });
};

/**
 * Asks an admin to close a job that is past the "open" stage. The job keeps
 * running (and stays on the page) until the request is approved.
 */
export const requestMockJobClosure = async (
  jobId: string,
  request: { reason: JobClosureReason; explanation: string },
): Promise<ClientJobOverview> => {
  await delay(500);
  const job = findJob(jobId);
  const policy = jobClosurePolicy(job);
  if (policy === "close_now") {
    throw new ClientJobError(
      "CLOSURE_NOT_NEEDED",
      "Open jobs can be closed right away.",
    );
  }
  if (policy !== "request_approval") {
    throw new ClientJobError(
      "JOB_NOT_CLOSABLE",
      "A closure request is already waiting for approval.",
    );
  }
  return replaceJob({
    ...job,
    closureRequest: {
      reason: request.reason,
      explanation: request.explanation.trim(),
      requestedAt: new Date().toISOString(),
      state: "pending",
    },
  });
};
