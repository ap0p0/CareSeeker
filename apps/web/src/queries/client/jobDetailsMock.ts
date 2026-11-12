import {
  LANGUAGE_OPTIONS,
  QUALIFICATION_OPTIONS,
  type ProfessionalQualification,
  type SpokenLanguage,
} from "../../utils/careOptions";
import { fetchMockClientJob, type ClientJobOverview } from "./openJobsOverview";

/**
 * Everything the seeker's job page shows around the post itself —
 * candidates (AI picks, applicants, interviews, offer, hire), conversations,
 * activity, visits and invoices. **Mock data**, derived from the job so it
 * always agrees with the overview card (same counts, same caregiver names),
 * and stable for a job (seeded from its internal key). None of this exists
 * on the backend yet.
 */

/** Where a caregiver stands on a job, from first match to hire. */
export type CandidateStage =
  /** Matched by the AI; has not applied. */
  | "recommended"
  /** Applied; the seeker has not looked yet. */
  | "new"
  | "shortlisted"
  | "reviewed"
  | "interviewing"
  | "offer"
  | "hired"
  | "declined";

export type JobCandidate = {
  /** Stable key of the (mock) caregiver. */
  key: string;
  name: string;
  headline: string;
  /** 0–5, `null` for caregivers without reviews yet. */
  rating: number | null;
  reviews: number;
  yearsExperience: number;
  /** Their usual hourly rate. */
  rateCents: number;
  distanceMiles: number;
  languages: string[];
  qualifications: string[];
  verified: boolean;
  /** 0–100: how well they fit this job's requirements. */
  matchScore: number;
  /** Why they fit, strongest first (e.g. "Speaks Spanish"). */
  matchReasons: string[];
  stage: CandidateStage;
  /** Applicants only. */
  appliedAt: string | null;
  proposedRateCents: number | null;
  coverNote: string | null;
  /** Interviewing only: next interview (ISO date-time). */
  interviewAt: string | null;
};

export type JobConversation = {
  key: string;
  name: string;
  /** What the other person is to this job ("Applicant", "Your caregiver"…). */
  role: string;
  lastMessage: string;
  /** Whether the last message came from them. */
  fromThem: boolean;
  at: string;
  unread: number;
};

export type JobActivityKind =
  | "posted"
  | "edited"
  | "applied"
  | "interview"
  | "offer"
  | "hired"
  | "paused"
  | "closure_requested"
  | "closed"
  | "payment";

export type JobActivity = { at: string; kind: JobActivityKind; text: string };

/** A visit of a hired caregiver (timesheet). */
export type JobVisit = {
  /** ISO date-time of the start. */
  at: string;
  hours: number;
  state: "completed" | "scheduled";
};

export type JobInvoice = {
  key: string;
  label: string;
  amountCents: number;
  state: "in_progress" | "due" | "overdue" | "paid";
  /** Due date or paid date (`YYYY-MM-DD`). */
  date: string | null;
};

export type ClientJobDetails = {
  job: ClientJobOverview;
  /** How many caregivers opened the post; `null` when not tracked. */
  views: number | null;
  /** AI matches, best first (a handful; `job.pipeline.recommended` counts all). */
  aiPicks: JobCandidate[];
  /** Everyone who applied, newest first. */
  applicants: JobCandidate[];
  conversations: JobConversation[];
  /** Newest first. */
  activity: JobActivity[];
  /** Hired jobs: recent and upcoming visits, newest first. */
  visits: JobVisit[];
  /** Hired jobs: newest first. */
  invoices: JobInvoice[];
};

// ─── Caregiver pool ──────────────────────────────────────────────────────────

type PoolCaregiver = {
  key: string;
  name: string;
  headline: string;
  rating: number | null;
  reviews: number;
  yearsExperience: number;
  rateCents: number;
  distanceMiles: number;
  languages: SpokenLanguage[];
  qualifications: ProfessionalQualification[];
  hasCar: boolean;
  wheelchairCar: boolean;
  verified: boolean;
};

const POOL: PoolCaregiver[] = [
  {
    key: "cg-ana",
    name: "Ana Torres",
    headline: "Home health aide · dementia & mobility care",
    rating: 4.9,
    reviews: 41,
    yearsExperience: 8,
    rateCents: 3000,
    distanceMiles: 2.4,
    languages: ["english", "spanish"],
    qualifications: ["hha", "cpr_first_aid_certification"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-james",
    name: "James Whitfield",
    headline: "CNA · post-surgery recovery and transfers",
    rating: 4.8,
    reviews: 27,
    yearsExperience: 6,
    rateCents: 3200,
    distanceMiles: 4.1,
    languages: ["english"],
    qualifications: ["cna", "cpr_first_aid_certification"],
    hasCar: true,
    wheelchairCar: true,
    verified: true,
  },
  {
    key: "cg-mei",
    name: "Mei Lin",
    headline: "Companion caregiver · meals, errands, outings",
    rating: 5,
    reviews: 12,
    yearsExperience: 3,
    rateCents: 2400,
    distanceMiles: 1.2,
    languages: ["english", "chinese"],
    qualifications: ["caregiver_certification"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-samuel",
    name: "Samuel Adeyemi",
    headline: "LPN · medication management & overnight care",
    rating: 4.7,
    reviews: 33,
    yearsExperience: 11,
    rateCents: 3800,
    distanceMiles: 7.8,
    languages: ["english", "french"],
    qualifications: ["lpn_lvn", "cpr_first_aid_certification"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-rosa",
    name: "Rosa Delgado",
    headline: "Live-in caregiver · bilingual, warm and patient",
    rating: 4.9,
    reviews: 58,
    yearsExperience: 14,
    rateCents: 2700,
    distanceMiles: 5.5,
    languages: ["spanish", "english"],
    qualifications: ["hha", "caregiver_certification"],
    hasCar: false,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-ethan",
    name: "Ethan Brooks",
    headline: "Caregiver & driver · appointments and errands",
    rating: 4.6,
    reviews: 19,
    yearsExperience: 4,
    rateCents: 2600,
    distanceMiles: 3.0,
    languages: ["english"],
    qualifications: ["cpr_first_aid_certification"],
    hasCar: true,
    wheelchairCar: true,
    verified: false,
  },
  {
    key: "cg-fatima",
    name: "Fatima Haddad",
    headline: "RN · complex care and family support",
    rating: 5,
    reviews: 22,
    yearsExperience: 12,
    rateCents: 4500,
    distanceMiles: 9.2,
    languages: ["english", "arabic"],
    qualifications: ["rn", "nursing_degree"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-olga",
    name: "Olga Petrova",
    headline: "Personal care aide · bathing, dressing, routines",
    rating: 4.5,
    reviews: 9,
    yearsExperience: 5,
    rateCents: 2500,
    distanceMiles: 6.3,
    languages: ["russian", "english"],
    qualifications: ["hha"],
    hasCar: false,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-marcus",
    name: "Marcus Reed",
    headline: "Caregiver for adults with disabilities",
    rating: 4.8,
    reviews: 16,
    yearsExperience: 7,
    rateCents: 2900,
    distanceMiles: 2.9,
    languages: ["english"],
    qualifications: ["caregiver_certification", "cpr_first_aid_certification"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-linh",
    name: "Linh Nguyen",
    headline: "Childcare & after-school help",
    rating: 4.9,
    reviews: 30,
    yearsExperience: 6,
    rateCents: 2200,
    distanceMiles: 1.8,
    languages: ["english", "vietnamese"],
    qualifications: [
      "early_childhood_education",
      "cpr_first_aid_certification",
    ],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-paulo",
    name: "Paulo Silva",
    headline: "Companion & light housekeeping",
    rating: null,
    reviews: 0,
    yearsExperience: 1,
    rateCents: 2000,
    distanceMiles: 4.7,
    languages: ["portuguese", "english", "spanish"],
    qualifications: [],
    hasCar: false,
    wheelchairCar: false,
    verified: false,
  },
  {
    key: "cg-priya",
    name: "Priya Sharma",
    headline: "CNA · hygiene, feeding and mobility support",
    rating: 4.7,
    reviews: 14,
    yearsExperience: 5,
    rateCents: 2800,
    distanceMiles: 3.6,
    languages: ["english", "hindi"],
    qualifications: ["cna"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-hannah",
    name: "Hannah Schultz",
    headline: "Overnight & respite care specialist",
    rating: 4.8,
    reviews: 25,
    yearsExperience: 9,
    rateCents: 3300,
    distanceMiles: 8.4,
    languages: ["english"],
    qualifications: ["hha", "cpr_first_aid_certification"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
  {
    key: "cg-kwame",
    name: "Kwame Mensah",
    headline: "Caregiver · transfers, exercises, walks",
    rating: 4.6,
    reviews: 11,
    yearsExperience: 3,
    rateCents: 2600,
    distanceMiles: 5.1,
    languages: ["english"],
    qualifications: ["caregiver_certification"],
    hasCar: true,
    wheelchairCar: false,
    verified: true,
  },
];

const COVER_NOTES = [
  "I have cared for several clients with similar needs and would love to meet you both.",
  "I live close by, I am punctual and I can start this week.",
  "Patience and routine matter most to me — I keep families updated after every visit.",
  "I am certified and experienced with transfers and personal care. Happy to do a short call first.",
  "I speak the same language as your loved one and I am flexible with the schedule.",
  "I enjoy companionship care: cooking together, walks and good conversation.",
];

const MESSAGE_TEMPLATES = {
  applicant: [
    "Thank you for looking at my application — do you have a few minutes for a call?",
    "Is the schedule flexible in the mornings?",
    "I just sent my certificates, let me know if you need anything else.",
    "Happy to answer any questions about my experience.",
  ],
  interviewing: [
    "Looking forward to our interview! Should I bring my certificates?",
    "Would it help if I met your family before we start?",
  ],
  offer: ["Thank you for the offer! I will confirm by tomorrow."],
  hired: [
    "Today went well — we had a walk and lunch together.",
    "Running 10 minutes late today, sorry!",
    "Could we swap Thursday's visit to Friday next week?",
  ],
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Small deterministic hash, so a job always gets the same mock content. */
const hash = (text: string): number => {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
};

const languageLabel = (value: SpokenLanguage) =>
  LANGUAGE_OPTIONS.find((option) => option.value === value)?.label.split(
    " (",
  )[0] ?? value;

const qualificationShort = (value: ProfessionalQualification) => {
  const label =
    QUALIFICATION_OPTIONS.find((option) => option.value === value)?.label ??
    value;
  return label.match(/\(([^)]+)\)/)?.[1] ?? label;
};

const firstName = (name: string) => name.split(" ")[0];

/** How well a caregiver fits the job, with the reasons (strongest first). */
const matchCaregiver = (caregiver: PoolCaregiver, job: ClientJobOverview) => {
  const { details } = job;
  const preferences = details.caregiverPreferences;
  const reasons: { weight: number; text: string }[] = [];
  let score = 50 + (hash(`${job.id}:${caregiver.key}`) % 12);

  if (preferences.language) {
    if (caregiver.languages.includes(preferences.language)) {
      score += 10;
      reasons.push({
        weight: 10,
        text: `Speaks ${languageLabel(preferences.language)}`,
      });
    } else {
      score -= 8;
    }
  }
  if (details.requiresCaregiverVehicle) {
    if (
      details.requiresWheelchairAccessibleVehicle &&
      caregiver.wheelchairCar
    ) {
      score += 12;
      reasons.push({ weight: 12, text: "Wheelchair-accessible car" });
    } else if (caregiver.hasCar) {
      score += details.requiresWheelchairAccessibleVehicle ? 2 : 8;
      reasons.push({ weight: 8, text: "Has a car" });
    } else {
      score -= 12;
    }
  }
  const sharedQualifications = preferences.requiredQualifications.filter(
    (qualification) => caregiver.qualifications.includes(qualification),
  );
  for (const qualification of sharedQualifications) {
    score += 6;
    reasons.push({ weight: 6, text: qualificationShort(qualification) });
  }
  if (
    preferences.minYearsExperience &&
    caregiver.yearsExperience >= preferences.minYearsExperience
  ) {
    score += 4;
    reasons.push({
      weight: 4,
      text: `${caregiver.yearsExperience} years of experience`,
    });
  }
  if (caregiver.distanceMiles <= 3) {
    score += 6;
    reasons.push({ weight: 5, text: `${caregiver.distanceMiles} mi away` });
  }
  const budget = details.budget;
  if (
    budget.paymentType === "hourly" &&
    budget.amountCents !== null &&
    caregiver.rateCents <= budget.amountCents
  ) {
    score += 6;
    reasons.push({ weight: 6, text: "Within your budget" });
  }
  if (caregiver.rating !== null && caregiver.rating >= 4.8) {
    score += 4;
    reasons.push({
      weight: 3,
      text: `${caregiver.rating.toFixed(1)} ★ (${caregiver.reviews} reviews)`,
    });
  }

  return {
    matchScore: Math.max(52, Math.min(98, score)),
    matchReasons: reasons
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((reason) => reason.text),
  };
};

const toCandidate = (
  caregiver: PoolCaregiver,
  job: ClientJobOverview,
  stage: CandidateStage,
  extra: Partial<JobCandidate> = {},
): JobCandidate => ({
  key: caregiver.key,
  name: caregiver.name,
  headline: caregiver.headline,
  rating: caregiver.rating,
  reviews: caregiver.reviews,
  yearsExperience: caregiver.yearsExperience,
  rateCents: caregiver.rateCents,
  distanceMiles: caregiver.distanceMiles,
  languages: caregiver.languages.map(languageLabel),
  qualifications: caregiver.qualifications.map(qualificationShort),
  verified: caregiver.verified,
  ...matchCaregiver(caregiver, job),
  stage,
  appliedAt: null,
  proposedRateCents: null,
  coverNote: null,
  interviewAt: null,
  ...extra,
});

/** A pool profile under another name (the offer / hired caregiver). */
const named = (name: string, base: PoolCaregiver): PoolCaregiver => ({
  ...base,
  key: `cg-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
  name,
});

// ─── Building a job's page ───────────────────────────────────────────────────

/** An interview in the next days at a round hour (10:00, 14:00, …). */
const interviewSlot = (now: number, index: number): string => {
  const date = new Date(now + (index + 1) * DAY_MS);
  date.setHours([10, 14, 16][index % 3], 0, 0, 0);
  return date.toISOString();
};

const buildCandidates = (job: ClientJobOverview, now: number) => {
  const seed = hash(job.id);
  const ranked = [...POOL].sort(
    (a, b) =>
      matchCaregiver(b, job).matchScore - matchCaregiver(a, job).matchScore,
  );
  const posted = new Date(job.postedAt).getTime();
  // Once someone is hired, every application came before their start.
  const end = job.caregiver
    ? new Date(`${job.caregiver.startedOn}T08:00:00`).getTime() - DAY_MS
    : now;
  const span = Math.max(end - posted, 6 * HOUR_MS);
  const proposal = (caregiver: PoolCaregiver, index: number) => ({
    proposedRateCents:
      job.details.budget.paymentType === "hourly"
        ? caregiver.rateCents + ((seed + index) % 3) * 100 - 100
        : null,
    coverNote: COVER_NOTES[(seed + index) % COVER_NOTES.length],
  });

  // The caregivers who already have a role on the job (card names). They
  // borrow the best match's profile, which then is not listed again.
  const special: JobCandidate[] = [];
  const borrowed = new Set<string>();
  if (job.status === "offer_sent" && job.offer) {
    borrowed.add(ranked[0].key);
    const caregiver = named(job.offer.caregiverName, ranked[0]);
    special.push(
      toCandidate(caregiver, job, "offer", {
        appliedAt: new Date(posted + span * 0.2).toISOString(),
        ...proposal(caregiver, 0),
      }),
    );
  }
  if (job.status === "hired" && job.caregiver) {
    borrowed.add(ranked[0].key);
    const caregiver = named(job.caregiver.name, {
      ...ranked[0],
      rating: job.caregiver.rating,
    });
    special.push(
      toCandidate(caregiver, job, "hired", {
        appliedAt: new Date(posted + span * 0.15).toISOString(),
        ...proposal(caregiver, 0),
      }),
    );
  }

  // Everyone else who applied, spread over the time since posting.
  const pool = ranked.filter((caregiver) => !borrowed.has(caregiver.key));
  const others = Math.max(
    0,
    Math.min(job.pipeline.applied - special.length, pool.length),
  );
  const start = seed % Math.max(pool.length - others, 1);
  const applicantPool = pool.slice(start, start + others);
  const interviewing = job.status === "hired" ? 0 : job.pipeline.interviewing;
  const applicants = applicantPool.map((caregiver, index) => {
    const stage: CandidateStage =
      index < job.pipeline.newApplicants
        ? "new"
        : index < job.pipeline.newApplicants + interviewing
          ? "interviewing"
          : job.status === "hired"
            ? "declined"
            : (["shortlisted", "reviewed", "declined"] as const)[index % 3];
    // New applications are the latest ones.
    const fraction =
      stage === "new" ? 0.92 - index * 0.05 : 0.75 - index * (0.6 / others);
    return toCandidate(caregiver, job, stage, {
      appliedAt: new Date(
        posted + span * Math.max(fraction, 0.05),
      ).toISOString(),
      ...proposal(caregiver, index + 1),
      interviewAt: stage === "interviewing" ? interviewSlot(now, index) : null,
    });
  });

  const allApplicants = [...special, ...applicants].sort((a, b) =>
    (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""),
  );
  const appliedKeys = new Set(allApplicants.map((item) => item.key));
  const aiPicks = pool
    .slice(0, Math.min(job.pipeline.recommended, 4))
    .map(
      (caregiver) =>
        (appliedKeys.has(caregiver.key)
          ? allApplicants.find((item) => item.key === caregiver.key)
          : undefined) ?? toCandidate(caregiver, job, "recommended"),
    );

  return { applicants: allApplicants, aiPicks };
};

const buildConversations = (
  job: ClientJobOverview,
  applicants: JobCandidate[],
  now: number,
): JobConversation[] => {
  const seed = hash(job.id);
  const byStage = (stage: CandidateStage) =>
    applicants.filter((item) => item.stage === stage);
  const people: {
    candidate: JobCandidate;
    role: string;
    kind: keyof typeof MESSAGE_TEMPLATES;
  }[] = [
    ...byStage("hired").map((candidate) => ({
      candidate,
      role: "Your caregiver",
      kind: "hired" as const,
    })),
    ...byStage("offer").map((candidate) => ({
      candidate,
      role: "Offer sent",
      kind: "offer" as const,
    })),
    ...byStage("interviewing").map((candidate) => ({
      candidate,
      role: "Interviewing",
      kind: "interviewing" as const,
    })),
    ...byStage("new").map((candidate) => ({
      candidate,
      role: "Applicant",
      kind: "applicant" as const,
    })),
  ].slice(0, 4);

  let unreadLeft = job.unreadMessages;
  return people.map(({ candidate, role, kind }, index) => {
    const templates = MESSAGE_TEMPLATES[kind];
    // Unread messages go to the most recent conversations first.
    const unread =
      index === people.length - 1 ? unreadLeft : Math.min(unreadLeft, 2);
    unreadLeft -= unread;
    return {
      key: candidate.key,
      name: candidate.name,
      role,
      // Each conversation in a group gets its own message.
      lastMessage:
        templates[
          (seed +
            people.filter((item, at) => at < index && item.kind === kind)
              .length) %
            templates.length
        ],
      fromThem: unread > 0 || index % 2 === 0,
      at: new Date(now - (index * 7 + 2) * HOUR_MS).toISOString(),
      unread,
    };
  });
};

const buildActivity = (
  job: ClientJobOverview,
  applicants: JobCandidate[],
): JobActivity[] => {
  const items: JobActivity[] = [
    { at: job.postedAt, kind: "posted", text: "You posted the job" },
  ];
  for (const applicant of applicants) {
    if (applicant.appliedAt) {
      items.push({
        at: applicant.appliedAt,
        kind: "applied",
        text: `${applicant.name} applied`,
      });
    }
    if (applicant.stage === "interviewing" && applicant.appliedAt) {
      items.push({
        at: new Date(
          new Date(applicant.appliedAt).getTime() + 20 * HOUR_MS,
        ).toISOString(),
        kind: "interview",
        text: `Interview scheduled with ${firstName(applicant.name)}`,
      });
    }
  }
  if (job.offer) {
    items.push({
      at: job.offer.sentAt,
      kind: "offer",
      text: `You sent an offer to ${job.offer.caregiverName}`,
    });
  }
  if (job.caregiver) {
    items.push({
      at: new Date(`${job.caregiver.startedOn}T09:00:00`).toISOString(),
      kind: "hired",
      text: `${job.caregiver.name} started working`,
    });
  }
  if (job.billing?.paidOn) {
    items.push({
      at: new Date(`${job.billing.paidOn}T12:00:00`).toISOString(),
      kind: "payment",
      text: "Payment completed",
    });
  }
  if (job.editedAt) {
    items.push({
      at: job.editedAt,
      kind: "edited",
      text: "You edited the job post",
    });
  }
  if (job.pausedAt) {
    items.push({
      at: job.pausedAt,
      kind: "paused",
      text: "You paused the job",
    });
  }
  if (job.closureRequest) {
    items.push({
      at: job.closureRequest.requestedAt,
      kind: "closure_requested",
      text: "You asked an admin to close the job",
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
};

const visitHours = (job: ClientJobOverview): number => {
  const recurring = job.details.recurring;
  if (job.details.visit) {
    const [startH, startM] = job.details.visit.startTime.split(":").map(Number);
    const [endH, endM] = job.details.visit.endTime.split(":").map(Number);
    return (endH * 60 + endM - startH * 60 - startM) / 60;
  }
  const days = recurring?.scheduleDays.length || 1;
  return Math.max(
    1,
    Math.round(((recurring?.hoursPerWeek ?? 4) / days) * 2) / 2,
  );
};

const buildVisits = (job: ClientJobOverview, now: number): JobVisit[] => {
  if (job.status !== "hired" || !job.caregiver) return [];
  const hours = visitHours(job);
  const visits: JobVisit[] = [];
  if (job.caregiver.nextVisitAt) {
    visits.push({ at: job.caregiver.nextVisitAt, hours, state: "scheduled" });
  }
  const scheduleDays = job.details.recurring?.scheduleDays ?? [];
  const days = new Set(scheduleDays.map((day) => day.dayOfWeek));
  // Past visits start when the schedule says (9:00 for "all day").
  const startOf = (dayOfWeek: number): [number, number] => {
    const window = scheduleDays.find((day) => day.dayOfWeek === dayOfWeek)
      ?.windows[0];
    if (!window) return [9, 0];
    const [hours, minutes] = window.start.split(":").map(Number);
    return [hours, minutes];
  };
  const started = new Date(`${job.caregiver.startedOn}T00:00:00`).getTime();
  // Walk back from yesterday to the scheduled days since the start.
  for (let offset = 1; offset <= 28 && visits.length < 5; offset += 1) {
    const date = new Date(now - offset * DAY_MS);
    if (date.getTime() < started) break;
    if (days.size === 0 || days.has(date.getDay())) {
      const [hours, minutes] = startOf(date.getDay());
      date.setHours(hours, minutes, 0, 0);
      visits.push({ at: date.toISOString(), hours, state: "completed" });
    }
  }
  if (days.size === 0 && job.details.visit) {
    visits.push({
      at: new Date(
        `${job.details.visit.date}T${job.details.visit.startTime}:00`,
      ).toISOString(),
      hours,
      state: "completed",
    });
  }
  return visits;
};

const buildInvoices = (job: ClientJobOverview): JobInvoice[] => {
  const billing = job.billing;
  if (job.status !== "hired" || !billing) return [];
  if (billing.paymentType === "fixed_price") {
    return [
      {
        key: "fixed",
        label: "Fixed price",
        amountCents: billing.amountCents,
        state: billing.state,
        date: billing.paidOn ?? billing.dueOn,
      },
    ];
  }
  const amount = Math.round(billing.rateCents * billing.hours);
  const weekLabel = (start: string) => {
    const date = new Date(`${start}T00:00:00`);
    return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };
  const current: JobInvoice = {
    key: billing.periodStart,
    label: weekLabel(billing.periodStart),
    amountCents: amount,
    state: billing.state === "accruing" ? "in_progress" : billing.state,
    date: billing.state === "paid" ? billing.paidOn : billing.dueOn,
  };
  // Earlier weeks since the caregiver started were paid.
  const earlier: JobInvoice[] = [];
  const started = job.caregiver
    ? new Date(`${job.caregiver.startedOn}T00:00:00`).getTime()
    : Date.now();
  let start = new Date(`${billing.periodStart}T00:00:00`).getTime();
  for (let week = 1; week <= 2; week += 1) {
    start -= 7 * DAY_MS;
    if (start < started - 6 * DAY_MS) break;
    const day = new Date(start).toISOString().slice(0, 10);
    const paid = new Date(start + 10 * DAY_MS).toISOString().slice(0, 10);
    earlier.push({
      key: day,
      label: weekLabel(day),
      amountCents: Math.round(
        billing.rateCents *
          (job.details.recurring?.hoursPerWeek ?? billing.hours),
      ),
      state: "paid",
      date: paid,
    });
  }
  return [current, ...earlier];
};

/** The job page of one job (by public `jobId`); `null` when not found. */
export const fetchMockClientJobDetails = async (
  jobId: string,
): Promise<ClientJobDetails | null> => {
  const job = await fetchMockClientJob(jobId);
  if (!job) return null;
  const now = Date.now();
  const { applicants, aiPicks } = buildCandidates(job, now);
  return {
    job,
    views:
      18 +
      job.pipeline.applied * 6 +
      job.pipeline.recommended * 2 +
      (hash(job.id) % 10),
    aiPicks,
    applicants,
    conversations: buildConversations(job, applicants, now),
    activity: buildActivity(job, applicants),
    visits: buildVisits(job, now),
    invoices: buildInvoices(job),
  };
};
