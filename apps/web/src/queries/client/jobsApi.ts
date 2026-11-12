import {
  getApiErrorMessage,
  getApiErrorStatus,
  httpClient,
} from "../../api/httpClient";
import { requireClientAuthHeaders } from "./authHeaders";
import { ClientAuthApiError } from "./errors";
import type { JobActivity, ClientJobDetails } from "./jobDetailsMock";
import {
  detailsFromPayload,
  type ClientJobOverview,
  type JobPostStatus,
} from "./openJobsOverview";
import {
  SEEKER_JOBS_PATH,
  type CreateJobPayload,
  type Job,
  type JobApiStatus,
} from "./jobs";

/**
 * Real jobs, through the API (`/seeker/jobs`). The open jobs page and the
 * job page read the same model as the sample data (`ClientJobOverview`);
 * what does not exist on the backend yet — AI matches, applicants,
 * interviews, messages, hiring, payments — is simply empty for real jobs.
 */

const STATUS: Record<JobApiStatus, JobPostStatus> = {
  open: "open",
  paused: "paused",
  closed: "closed",
  // Hiring is not built yet; a job in progress has a caregiver at work.
  in_progress: "hired",
  completed: "completed",
  cancelled: "cancelled",
};

/** An API job → the model of the open jobs / job pages. */
export const overviewFromJob = (job: Job): ClientJobOverview => ({
  jobId: job.jobId,
  // The API never exposes its internal key; the public id stands in.
  id: job.jobId,
  status: STATUS[job.status],
  title: job.title,
  description: job.description,
  city: job.city ?? "",
  state: job.state ?? "",
  postalCode: job.postalCode ?? "",
  // Jobs from before job posts carried details: an empty weekly request.
  details:
    job.details ??
    detailsFromPayload({
      careFrequency: "weekly",
      careTasks: [],
      scheduleFlexible: false,
      requiresWheelchairAccessibleVehicle: false,
      petsInHome: false,
      homeAccessibility: [],
      specialRequirements: null,
      budget: { paymentType: "hourly", amountCents: null },
      caregiverPreferences: {
        gender: "no_preference",
        language: null,
        requiredQualifications: [],
        minYearsExperience: null,
        culturalConsiderations: null,
      },
    }),
  postedAt: job.createdAt,
  pipeline: { recommended: 0, applied: 0, newApplicants: 0, interviewing: 0 },
  unreadMessages: 0,
  offer: null,
  caregiver: null,
  billing: null,
  pausedAt: job.pausedAt,
  editedAt: job.editedAt,
  closureRequest: null,
  closedAt: job.closedAt,
});

/** The job page of a real job: the job, and what happened to it. */
export const detailsFromJob = (job: ClientJobOverview): ClientJobDetails => {
  const activity: JobActivity[] = [
    { at: job.postedAt, kind: "posted", text: "You posted the job" },
  ];
  if (job.editedAt) {
    activity.push({
      at: job.editedAt,
      kind: "edited",
      text: "You edited the job post",
    });
  }
  if (job.pausedAt) {
    activity.push({
      at: job.pausedAt,
      kind: "paused",
      text: "You paused the job",
    });
  }
  if (job.closedAt) {
    activity.push({
      at: job.closedAt,
      kind: "closed",
      text: "You closed the job",
    });
  }
  return {
    job,
    // Post views are not tracked yet.
    views: null,
    aiPicks: [],
    applicants: [],
    conversations: [],
    activity: activity.sort((a, b) => b.at.localeCompare(a.at)),
    visits: [],
    invoices: [],
  };
};

const failure = (error: unknown, fallback: string) =>
  new ClientAuthApiError(getApiErrorMessage(error, fallback));

/** `GET /seeker/jobs` — running jobs (open, paused, in progress). */
export const fetchApiOpenJobs = async (): Promise<ClientJobOverview[]> => {
  const headers = await requireClientAuthHeaders();
  try {
    const { data } = await httpClient.get<Job[]>(SEEKER_JOBS_PATH, {
      headers,
    });
    return data.map(overviewFromJob);
  } catch (error) {
    throw failure(error, "Could not load your jobs.");
  }
};

/** `GET /seeker/jobs/:jobId`; `null` when it does not exist (404 / 400). */
export const fetchApiJob = async (
  jobId: string,
): Promise<ClientJobOverview | null> => {
  const headers = await requireClientAuthHeaders();
  try {
    const { data } = await httpClient.get<Job>(
      `${SEEKER_JOBS_PATH}/${encodeURIComponent(jobId)}`,
      { headers },
    );
    return overviewFromJob(data);
  } catch (error) {
    const status = getApiErrorStatus(error);
    if (status === 404 || status === 400) return null;
    throw failure(error, "Could not load this job.");
  }
};

/** `PUT /seeker/jobs/:jobId` — saves the edited post (open jobs only). */
export const updateApiJob = async (
  jobId: string,
  payload: CreateJobPayload,
): Promise<ClientJobOverview> => {
  const headers = await requireClientAuthHeaders();
  try {
    const { data } = await httpClient.put<{ data: Job }>(
      `${SEEKER_JOBS_PATH}/${encodeURIComponent(jobId)}`,
      payload,
      { headers },
    );
    return overviewFromJob(data.data);
  } catch (error) {
    throw failure(error, "Could not save your changes. Please try again.");
  }
};

const lifecycle =
  (action: "pause" | "resume" | "close", fallback: string) =>
  async (jobId: string): Promise<ClientJobOverview> => {
    const headers = await requireClientAuthHeaders();
    try {
      const { data } = await httpClient.post<{ data: Job }>(
        `${SEEKER_JOBS_PATH}/${encodeURIComponent(jobId)}/${action}`,
        undefined,
        { headers },
      );
      return overviewFromJob(data.data);
    } catch (error) {
      throw failure(error, fallback);
    }
  };

export const pauseApiJob = lifecycle(
  "pause",
  "Could not pause the job. Please try again.",
);
export const resumeApiJob = lifecycle(
  "resume",
  "Could not resume the job. Please try again.",
);
export const closeApiJob = lifecycle(
  "close",
  "Could not close the job. Please try again.",
);
