import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import { requireClientAuthHeaders } from "./authHeaders";
import type {
  CarePreferences,
  CarePreferencesPayload,
} from "./carePreferences";
import { ClientAuthApiError } from "./errors";

export const SEEKER_JOBS_PATH = "/seeker/jobs" as const;

/**
 * Care details of a job post: exactly the care-preferences shape (same
 * vocabulary and rules), so the registration form model is reused.
 */
export type JobDetails = Omit<CarePreferences, "updatedAt">;

/** Where care takes place; the street address is never part of a post. */
export type JobLocation = {
  city: string;
  /** USPS state code */
  state: string;
  /** ZIP or ZIP+4 */
  postalCode: string;
};

/** A prefilled, unsaved job post (`""` where nothing is known). */
export type JobDraft = JobLocation & {
  title: string;
  description: string;
  /** `null` when there was nothing to prefill. */
  details: JobDetails | null;
};

export type JobDraftResponse = {
  /** The profile the draft was prefilled from; `null` = empty draft. */
  source: { careRecipientId: string; careRecipientName: string } | null;
  draft: JobDraft;
};

export type JobTextPayload = JobLocation & { details: CarePreferencesPayload };

export type JobText = { title: string; description: string };

export type CreateJobPayload = JobTextPayload & JobText;

/** Mirrors the API `JobStatus` enum. */
export type JobApiStatus =
  | "open"
  | "paused"
  | "closed"
  | "in_progress"
  | "completed"
  | "cancelled";

/** A saved job as returned by `/seeker/jobs`. */
export type Job = JobLocation & {
  /** Public job id: links (`/jobs/<jobId>`) and `/seeker/jobs/:jobId`. */
  jobId: string;
  status: JobApiStatus;
  title: string;
  description: string;
  careRecipientId: string | null;
  /** `null` for jobs created before job posts carried care details. */
  details: JobDetails | null;
  createdAt: string;
  updatedAt: string;
  /** Last change to the post itself. */
  editedAt: string | null;
  pausedAt: string | null;
  closedAt: string | null;
};

const validationAware = (error: unknown, fallback: string) =>
  new ClientAuthApiError(
    getApiErrorMessage(error, fallback),
    getApiErrorCode(error) === "VALIDATION_ERROR"
      ? "VALIDATION_ERROR"
      : "UNKNOWN_ERROR",
  );

/** `GET /seeker/jobs/draft` — a new job post prefilled from the profile. */
export const fetchJobDraft = async (): Promise<JobDraftResponse> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.get<JobDraftResponse>(
      `${SEEKER_JOBS_PATH}/draft`,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ClientAuthApiError(
      getApiErrorMessage(error, "Could not prepare your job post."),
    );
  }
};

/** `POST /seeker/jobs/draft/text` — a new title and description (not saved). */
export const generateJobText = async (
  payload: JobTextPayload,
): Promise<JobText> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.post<JobText>(
      `${SEEKER_JOBS_PATH}/draft/text`,
      payload,
      { headers },
    );
    return data;
  } catch (error) {
    throw validationAware(
      error,
      "Could not write a new title and description. Please try again.",
    );
  }
};

/** `POST /seeker/jobs` — posts the job (status `open`). */
export const createJob = async (payload: CreateJobPayload): Promise<Job> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.post<{ data: Job }>(
      SEEKER_JOBS_PATH,
      payload,
      { headers },
    );
    return data.data;
  } catch (error) {
    throw validationAware(error, "Could not post your job. Please try again.");
  }
};
