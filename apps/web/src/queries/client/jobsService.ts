import { isDemoSession } from "./demoMode";
import { demoJobDraft, demoJobTextFor } from "./demoProfile";
import {
  fetchMockClientJobDetails,
  type ClientJobDetails,
} from "./jobDetailsMock";
import type { JobClosureReason } from "./jobPolicies";
import {
  createJob,
  fetchJobDraft,
  generateJobText,
  type CreateJobPayload,
  type Job,
  type JobDraftResponse,
  type JobText,
  type JobTextPayload,
} from "./jobs";
import {
  closeApiJob,
  detailsFromJob,
  fetchApiJob,
  fetchApiOpenJobs,
  pauseApiJob,
  resumeApiJob,
  updateApiJob,
} from "./jobsApi";
import {
  closeMockClientJob,
  createMockClientJob,
  fetchMockClientJob,
  fetchMockClientOpenJobs,
  pauseMockClientJob,
  requestMockJobClosure,
  resumeMockClientJob,
  updateMockClientJob,
  type ClientJobOverview,
} from "./openJobsOverview";

/**
 * Everything the job screens (new job, open jobs, job page, edit) read and
 * change, behind one interface with two implementations:
 *
 * - `apiJobsService` — the signed-in seeker's real jobs (`/seeker/jobs`);
 * - `sampleJobsService` — the sample data of a demo session ("Explore with
 *   sample data" on the login page), entirely in the browser.
 *
 * The hooks call `jobsService()`, so screens never need to know which one
 * they are talking to.
 */
export type ClientJobsService = {
  source: "api" | "sample";
  listOpenJobs: (options: { empty: boolean }) => Promise<ClientJobOverview[]>;
  getJob: (jobId: string) => Promise<ClientJobOverview | null>;
  getJobDetails: (jobId: string) => Promise<ClientJobDetails | null>;
  createJob: (payload: CreateJobPayload) => Promise<Job>;
  updateJob: (
    jobId: string,
    payload: CreateJobPayload,
  ) => Promise<ClientJobOverview>;
  pauseJob: (jobId: string) => Promise<ClientJobOverview>;
  resumeJob: (jobId: string) => Promise<ClientJobOverview>;
  closeJob: (jobId: string) => Promise<ClientJobOverview>;
  /**
   * Asking an admin to close a job past the open stage — sample data only
   * (`null`: not available yet for real jobs).
   */
  requestClosure:
    | ((
        jobId: string,
        request: { reason: JobClosureReason; explanation: string },
      ) => Promise<ClientJobOverview>)
    | null;
  fetchDraft: () => Promise<JobDraftResponse>;
  generateText: (payload: JobTextPayload) => Promise<JobText>;
};

export const apiJobsService: ClientJobsService = {
  source: "api",
  listOpenJobs: () => fetchApiOpenJobs(),
  getJob: fetchApiJob,
  getJobDetails: async (jobId) => {
    const job = await fetchApiJob(jobId);
    return job ? detailsFromJob(job) : null;
  },
  createJob,
  updateJob: updateApiJob,
  pauseJob: pauseApiJob,
  resumeJob: resumeApiJob,
  closeJob: closeApiJob,
  requestClosure: null,
  fetchDraft: fetchJobDraft,
  generateText: generateJobText,
};

const later = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const sampleJobsService: ClientJobsService = {
  source: "sample",
  listOpenJobs: fetchMockClientOpenJobs,
  getJob: fetchMockClientJob,
  getJobDetails: fetchMockClientJobDetails,
  createJob: createMockClientJob,
  updateJob: updateMockClientJob,
  pauseJob: pauseMockClientJob,
  resumeJob: resumeMockClientJob,
  closeJob: closeMockClientJob,
  requestClosure: requestMockJobClosure,
  fetchDraft: () => later(demoJobDraft()),
  generateText: (payload) => later(demoJobTextFor(payload), 600),
};

/** The service of the current session (sample data in a demo). */
export const jobsService = (): ClientJobsService =>
  isDemoSession() ? sampleJobsService : apiJobsService;
