import type { ClientJobOverview, JobPostStatus } from "./openJobsOverview";

/**
 * What a seeker may do with a job, by status. Used by the UI (which actions
 * to offer, and how) and by the mock service (which refuses the rest), so
 * the backend can adopt the same rules once these actions exist there.
 */

/**
 * Requirements can only change while the job is simply open: once
 * candidates are being interviewed, an offer is out or a caregiver is
 * hired, they agreed to the job as it was.
 */
export const EDITABLE_JOB_STATUSES: readonly JobPostStatus[] = ["open"];

export const canEditJob = (job: Pick<ClientJobOverview, "status">): boolean =>
  EDITABLE_JOB_STATUSES.includes(job.status);

/** Why a job cannot be edited (for the UI). */
export const editLockedReason = (
  job: Pick<ClientJobOverview, "status">,
): string | null => {
  switch (job.status) {
    case "open":
      return null;
    case "interviewing":
    case "offer_sent":
      return "You are interviewing candidates, so the requirements are locked.";
    case "hired":
      return "A caregiver is hired, so the requirements are locked.";
    case "paused":
      return "Only open jobs can be edited. Resume the job first.";
    default:
      return "This job is finished.";
  }
};

/**
 * Pausing hides a job from caregivers (no new applications; received ones
 * stay). Only an open job can be paused — once candidates are interviewing
 * or a caregiver is hired, the job is in motion and has to be closed
 * instead. Resuming a paused job makes it open again.
 */
export const canPauseJob = (job: Pick<ClientJobOverview, "status">): boolean =>
  job.status === "open";

export const canResumeJob = (job: Pick<ClientJobOverview, "status">): boolean =>
  job.status === "paused";

/** Why a job cannot be paused (for the UI); `null` when it can. */
export const pauseLockedReason = (
  job: Pick<ClientJobOverview, "status">,
): string | null => {
  switch (job.status) {
    case "open":
    case "paused":
      return null;
    case "interviewing":
    case "offer_sent":
      return "You are interviewing candidates, so the job can no longer be paused.";
    case "hired":
      return "A caregiver is working on this job, so it can’t be paused.";
    default:
      return "This job is finished.";
  }
};

/**
 * Closing moves a job to the archive. Only an open job is closed right
 * away; any other running job needs a reason and an admin's approval.
 */
export type JobClosurePolicy = "close_now" | "request_approval" | "not_allowed";

export const jobClosurePolicy = (
  job: Pick<ClientJobOverview, "status" | "closureRequest">,
): JobClosurePolicy => {
  if (
    job.status === "completed" ||
    job.status === "cancelled" ||
    job.status === "closed"
  ) {
    return "not_allowed";
  }
  if (job.closureRequest?.state === "pending") return "not_allowed";
  return job.status === "open" ? "close_now" : "request_approval";
};

/**
 * Who may ask for compensation when the job is closed early: candidates in
 * interviews (or the one holding an offer), or the hired caregiver.
 */
export type CompensationRisk = "interviewing" | "hired" | null;

export const closureCompensationRisk = (
  job: Pick<ClientJobOverview, "status" | "pipeline">,
): CompensationRisk => {
  if (job.status === "hired") return "hired";
  if (
    job.status === "interviewing" ||
    job.status === "offer_sent" ||
    job.pipeline.interviewing > 0
  ) {
    return "interviewing";
  }
  return null;
};

export type JobClosureReason =
  | "no_longer_needed"
  | "found_care_elsewhere"
  | "caregiver_issue"
  | "schedule_or_budget_changed"
  | "other";

export const JOB_CLOSURE_REASONS: {
  value: JobClosureReason;
  label: string;
  /** Only offered once a caregiver is hired. */
  hiredOnly?: boolean;
}[] = [
  { value: "no_longer_needed", label: "Care is no longer needed" },
  { value: "found_care_elsewhere", label: "We found care elsewhere" },
  {
    value: "caregiver_issue",
    label: "A problem with the caregiver",
    hiredOnly: true,
  },
  {
    value: "schedule_or_budget_changed",
    label: "The schedule or budget changed",
  },
  { value: "other", label: "Something else" },
];

export const CLOSURE_EXPLANATION_MIN_LENGTH = 10;
export const CLOSURE_EXPLANATION_MAX_LENGTH = 1000;
