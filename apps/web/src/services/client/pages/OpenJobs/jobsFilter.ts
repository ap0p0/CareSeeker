import type {
  ClientJobOverview,
  JobPostStatus,
} from "../../../../queries/client";
import { JOB_STATUS_META, OPEN_JOB_STATUS_ORDER } from "./jobOverviewDisplay";

/**
 * What the open jobs page shows: everything, one status (the chips), or
 * the jobs behind one of the summary tiles. Kept in the URL (`?status=` /
 * `?show=`) so coming back from a job page restores the view.
 */
export type SummaryFilter =
  | "active"
  | "new_applicants"
  | "interviewing"
  | "payments_due";

export type JobsFilter =
  | { kind: "all" }
  | { kind: "status"; status: JobPostStatus }
  | { kind: "summary"; summary: SummaryFilter };

const isPaymentDue = (job: ClientJobOverview) =>
  job.billing?.state === "due" || job.billing?.state === "overdue";

/** Which jobs each summary tile stands for (and counts). */
export const SUMMARY_FILTERS: Record<
  SummaryFilter,
  { matches: (job: ClientJobOverview) => boolean; showing: string }
> = {
  active: {
    matches: (job) => job.status !== "paused",
    showing: "active jobs (not paused)",
  },
  new_applicants: {
    matches: (job) => job.pipeline.newApplicants > 0,
    showing: "jobs with new applicants",
  },
  interviewing: {
    matches: (job) => job.status !== "hired" && job.pipeline.interviewing > 0,
    showing: "jobs with candidates in interviews",
  },
  payments_due: {
    matches: isPaymentDue,
    showing: "jobs with a payment due",
  },
};

export const matchesFilter = (
  job: ClientJobOverview,
  filter: JobsFilter,
): boolean => {
  switch (filter.kind) {
    case "all":
      return true;
    case "status":
      return job.status === filter.status;
    case "summary":
      return SUMMARY_FILTERS[filter.summary].matches(job);
  }
};

export const describeFilter = (filter: JobsFilter): string =>
  filter.kind === "summary"
    ? SUMMARY_FILTERS[filter.summary].showing
    : filter.kind === "status"
      ? `${JOB_STATUS_META[filter.status].label.toLowerCase()} jobs`
      : "all jobs";

const STATUS_PARAM = "status";
const SUMMARY_PARAM = "show";

export const parseJobsFilter = (params: URLSearchParams): JobsFilter => {
  const summary = params.get(SUMMARY_PARAM);
  if (summary && summary in SUMMARY_FILTERS) {
    return { kind: "summary", summary: summary as SummaryFilter };
  }
  const status = params.get(STATUS_PARAM);
  if (status && OPEN_JOB_STATUS_ORDER.includes(status as JobPostStatus)) {
    return { kind: "status", status: status as JobPostStatus };
  }
  return { kind: "all" };
};

/** `params` with the filter applied (other params, e.g. `preview`, kept). */
export const withJobsFilter = (
  params: URLSearchParams,
  filter: JobsFilter,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  next.delete(STATUS_PARAM);
  next.delete(SUMMARY_PARAM);
  if (filter.kind === "status") next.set(STATUS_PARAM, filter.status);
  if (filter.kind === "summary") next.set(SUMMARY_PARAM, filter.summary);
  return next;
};

export const sameFilter = (a: JobsFilter, b: JobsFilter): boolean =>
  a.kind === b.kind &&
  (a.kind !== "status" || a.status === (b as typeof a).status) &&
  (a.kind !== "summary" || a.summary === (b as typeof a).summary);
