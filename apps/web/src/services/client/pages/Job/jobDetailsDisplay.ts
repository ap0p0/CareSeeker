import dayjs from "dayjs";
import type { ChipProps } from "@mui/material";
import type { CandidateStage } from "../../../../queries/client";
import type { JobSection } from "./jobLinks";

/** How a candidate's stage reads on the job page. */
export const CANDIDATE_STAGE_META: Record<
  CandidateStage,
  { label: string; color: ChipProps["color"] }
> = {
  recommended: { label: "AI pick", color: "secondary" },
  new: { label: "New", color: "success" },
  shortlisted: { label: "Shortlisted", color: "primary" },
  reviewed: { label: "Reviewed", color: "default" },
  interviewing: { label: "Interviewing", color: "info" },
  offer: { label: "Offer sent", color: "secondary" },
  hired: { label: "Hired", color: "primary" },
  declined: { label: "Declined", color: "default" },
};

/** "just now", "3 h ago", "yesterday", "4 days ago", "Oct 12". */
export const timeAgo = (iso: string, now = dayjs()): string => {
  const date = dayjs(iso);
  const minutes = now.diff(date, "minute");
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = now.diff(date, "hour");
  if (hours < 24) return `${hours} h ago`;
  const days = now.startOf("day").diff(date.startOf("day"), "day");
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return date.format("MMM D");
};

/** "Tue, Nov 10 · 9:00 AM" */
export const dateTimeLabel = (iso: string): string =>
  dayjs(iso).format("ddd, MMM D · h:mm A");

export const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Element id of a page section, for `?section=` deep links. */
export const sectionAnchor = (section: JobSection): string =>
  `job-section-${section}`;
