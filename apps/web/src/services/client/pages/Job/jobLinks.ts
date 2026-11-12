import { generatePath } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";

/**
 * Every job has its own page, `/jobs/<job id>` (e.g.
 * `client.careseeker.app/jobs/job-open-applicants`). Card actions link to
 * the part of that page they are about (`?section=`), so the page can open
 * there once it has content.
 */
export type JobSection =
  | "overview"
  | "recommendations"
  | "applicants"
  | "candidates"
  | "offer"
  | "timesheet"
  | "messages";

export const JOB_SECTION_LABELS: Record<JobSection, string> = {
  overview: "Job post",
  recommendations: "AI recommendations",
  applicants: "Applicants",
  candidates: "Candidates",
  offer: "Offer",
  timesheet: "Timesheet",
  messages: "Messages",
};

const SECTION_PARAM = "section";

export const jobPath = (jobId: string, section?: JobSection): string => {
  const path = generatePath(SEEKER_ROUTE_PATHS[SeekerRoute.JobDetails], {
    jobId,
  });
  return section && section !== "overview"
    ? `${path}?${SECTION_PARAM}=${section}`
    : path;
};

export const editJobPath = (jobId: string): string =>
  generatePath(SEEKER_ROUTE_PATHS[SeekerRoute.EditJob], { jobId });

export const parseJobSection = (searchParams: URLSearchParams): JobSection => {
  const section = searchParams.get(SECTION_PARAM);
  return section && section in JOB_SECTION_LABELS
    ? (section as JobSection)
    : "overview";
};
