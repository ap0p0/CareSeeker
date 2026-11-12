import type {
  CareDuration,
  CareFrequency,
  CareTask,
  CareUrgency,
  Gender,
  HomeAccessibility,
  MobilityLevel,
  PaymentType,
  PreferredCaregiverGender,
  ProfessionalQualification,
  RegistrantRelationship,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import type { UsCityStateZip } from '../../common/personal-info.validation';
import type { ScheduleDayInput } from '../../common/weekly-schedule.validation';
import type { CarePreferencesResponse } from '../care-preferences/care-preferences.types';

/**
 * Care details of a job post, in the care-preferences vocabulary (same
 * grouping as `PUT /seeker/care-preferences`). A validated payload
 * (`CarePreferencesInput`) always fits; details read back from the database
 * may have gaps (e.g. a recurring profile saved without an urgency), hence
 * the nullable recurring answers and caregiver gender.
 */
export type JobDetails = {
  careFrequency: CareFrequency;
  careTasks: CareTask[];
  visit: {
    /** UTC midnight of the visit day. */
    date: Date;
    startTime: string;
    endTime: string;
    notes: string | null;
  } | null;
  recurring: {
    hoursPerWeek: number | null;
    careDuration: CareDuration | null;
    careUrgency: CareUrgency | null;
    scheduleDays: ScheduleDayInput[];
    needsLiveInCare: boolean;
    needsEmergencyCover: boolean;
  } | null;
  scheduleFlexible: boolean;
  needsOvernightCare: boolean;
  requiresCaregiverVehicle: boolean;
  requiresWheelchairAccessibleVehicle: boolean;
  petsInHome: boolean;
  homeAccessibility: HomeAccessibility[];
  specialRequirements: string | null;
  budget: { paymentType: PaymentType; amountCents: number | null };
  caregiverPreferences: {
    gender: PreferredCaregiverGender | null;
    language: SpokenLanguage | null;
    requiredQualifications: ProfessionalQualification[];
    minYearsExperience: number | null;
    culturalConsiderations: string | null;
  };
};

/** Where care takes place. The street address is never part of a post. */
export type JobLocation = UsCityStateZip;

/** `POST /seeker/jobs`, after validation. */
export type JobPostInput = JobLocation & {
  title: string;
  description: string;
  details: JobDetails;
};

/** `POST /seeker/jobs/draft/text`, after validation. */
export type JobTextRequestInput = JobLocation & { details: JobDetails };

export type JobText = { title: string; description: string };

/**
 * What the text generator may use about the person receiving care. Never
 * their name or street address: a job post is meant to be shared.
 */
export type JobTextContext = {
  /** `self`: the seeker needs the care themself (no recipient / relationship). */
  careFor: 'self' | 'other';
  /** The registrant's side: `CHILD` = "I am their child". */
  relationship: RegistrantRelationship | null;
  recipient: {
    gender: Gender;
    /** UTC midnight. */
    dateOfBirth: Date;
    mobilityLevel: MobilityLevel | null;
    languagesSpoken: SpokenLanguage[];
    otherLanguage: string | null;
  } | null;
  city: string | null;
  state: string | null;
  /** Reference day for ages and "is the visit still ahead". */
  today: Date;
};

/** Job care details as returned to the frontend (care-preferences shape). */
export type JobDetailsResponse = Omit<CarePreferencesResponse, 'updatedAt'>;

/** A prefilled, not yet saved job post. Empty strings where nothing is known. */
export type JobDraft = JobText &
  JobLocation & {
    details: JobDetailsResponse | null;
  };

/** `GET /seeker/jobs/draft`. */
export type JobDraftResponse = {
  /**
   * The profile the draft was prefilled from; `null` when there was nothing
   * to prefill (accounts registered for oneself), i.e. an empty draft.
   */
  source: {
    careRecipientId: string;
    /** First name, for the page copy only (never put into the text). */
    careRecipientName: string;
  } | null;
  draft: JobDraft;
};

/** A saved job as returned by `/seeker/jobs`. */
export type JobResponse = {
  /**
   * Public id: links (`/jobs/<jobId>`) and `/seeker/jobs/:jobId`. The
   * internal primary key is never returned.
   */
  jobId: string;
  status: string | null;
  title: string;
  description: string;
  careRecipientId: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  /** `null` for jobs created before job posts carried care details. */
  details: JobDetailsResponse | null;
  /** Scaffold columns, left empty by job posts. */
  location: string | null;
  scheduledAt: Date | null;
  hourlyRateCents: number | null;
  createdAt: Date;
  updatedAt: Date;
  /** Last change to the post itself (not its status). */
  editedAt: Date | null;
  /** While paused. */
  pausedAt: Date | null;
  /** When the seeker closed the job. */
  closedAt: Date | null;
  deletedAt: Date | null;
};
