import dayjs from "dayjs";
import type { ChipProps } from "@mui/material";
import type {
  ClientJobOverview,
  JobPostStatus,
} from "../../../../queries/client";
import { formatCents, formatClock } from "../../../../utils/formatters";
import { DAY_OPTIONS } from "../../../../utils/weeklySchedule";
import type { JobSection } from "../Job/jobLinks";

/** How each status looks on the open jobs page and what it means. */
export const JOB_STATUS_META: Record<
  JobPostStatus,
  { label: string; color: ChipProps["color"]; hint: string }
> = {
  open: {
    label: "Open",
    color: "success",
    hint: "Caregivers can find the job and apply.",
  },
  interviewing: {
    label: "Interviewing",
    color: "info",
    hint: "You are talking to candidates.",
  },
  offer_sent: {
    label: "Offer sent",
    color: "secondary",
    hint: "Waiting for the caregiver to accept your offer.",
  },
  hired: {
    label: "Hired",
    color: "primary",
    hint: "A caregiver is working on this job.",
  },
  paused: {
    label: "Paused",
    color: "default",
    hint: "Hidden from caregivers until you resume it.",
  },
  completed: { label: "Completed", color: "default", hint: "Finished." },
  cancelled: { label: "Cancelled", color: "default", hint: "Cancelled." },
  closed: {
    label: "Closed",
    color: "default",
    hint: "Closed by you and moved to the archive.",
  },
};

/** Filter order on the page (finished statuses are never listed). */
export const OPEN_JOB_STATUS_ORDER: JobPostStatus[] = [
  "open",
  "interviewing",
  "offer_sent",
  "hired",
  "paused",
];

const FREQUENCY_SHORT: Record<
  ClientJobOverview["details"]["careFrequency"],
  string
> = {
  one_time: "One-time",
  daily: "Every day",
  weekly: "Weekly",
  monthly: "A few times a month",
};

/** "Mon, Wed, Fri" (Monday first), "Weekdays", "Weekends", "Every day". */
export const daysLabel = (days: readonly number[]): string => {
  const set = new Set(days);
  if (set.size === 7) return "Every day";
  const key = [...set].sort().join(",");
  if (key === "1,2,3,4,5") return "Weekdays";
  if (key === "0,6") return "Weekends";
  return DAY_OPTIONS.filter((day) => set.has(day.value))
    .map((day) => day.short)
    .join(", ");
};

/** e.g. "Weekly · Mon, Wed, Fri · ~12 h/week", "One-time · Tue, Dec 15 · 9:30 AM – 11:30 AM". */
export const scheduleLabel = (job: ClientJobOverview): string => {
  const { careFrequency, visit, recurring } = job.details;
  if (careFrequency === "one_time") {
    return visit
      ? `${FREQUENCY_SHORT.one_time} · ${dayjs(visit.date).format(
          "ddd, MMM D",
        )} · ${formatClock(visit.startTime)} – ${formatClock(visit.endTime)}`
      : FREQUENCY_SHORT.one_time;
  }
  return [
    FREQUENCY_SHORT[careFrequency],
    recurring?.needsLiveInCare
      ? "Live-in"
      : daysLabel(recurring?.scheduleDays.map((day) => day.dayOfWeek) ?? []),
    recurring?.hoursPerWeek ? `~${recurring.hoursPerWeek} h/week` : null,
  ]
    .filter(Boolean)
    .join(" · ");
};

/** "Up to $32 / hour", "$120 fixed price", "Budget open". */
export const budgetLabel = (job: ClientJobOverview): string => {
  const { amountCents, paymentType } = job.details.budget;
  if (amountCents === null) return "Budget open";
  return paymentType === "hourly"
    ? `Up to ${formatCents(amountCents)} / hour`
    : `${formatCents(amountCents)} fixed price`;
};

const daysBetween = (from: dayjs.Dayjs, to: dayjs.Dayjs): number =>
  to.startOf("day").diff(from.startOf("day"), "day");

/** "Posted today", "Posted 3 days ago", "Posted 2 weeks ago", "Posted Sep 12". */
export const postedLabel = (iso: string, now = dayjs()): string => {
  const days = daysBetween(dayjs(iso), now);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 14) return `Posted ${days} days ago`;
  if (days < 56) return `Posted ${Math.floor(days / 7)} weeks ago`;
  return `Posted ${dayjs(iso).format("MMM D")}`;
};

/** "today", "tomorrow", "in 3 days" / "yesterday", "3 days ago". */
export const relativeDay = (iso: string, now = dayjs()): string => {
  const days = daysBetween(now, dayjs(iso));
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
};

/** "Tue, Nov 10 at 8:00 AM" / "today at 3:00 PM". */
export const visitLabel = (iso: string, now = dayjs()): string => {
  const date = dayjs(iso);
  const days = daysBetween(now, date);
  const day =
    days === 0 ? "Today" : days === 1 ? "Tomorrow" : date.format("ddd, MMM D");
  return `${day} at ${date.format("h:mm A")}`;
};

export const formatDay = (isoDate: string): string =>
  dayjs(isoDate).format("MMM D");

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

export type JobAttention = {
  severity: "info" | "warning";
  text: string;
};

/**
 * The one thing on a job that waits for the seeker, if any (billing of
 * hired jobs has its own panel).
 */
export const jobAttention = (job: ClientJobOverview): JobAttention | null => {
  if (job.closureRequest?.state === "pending") {
    return {
      severity: "warning",
      text: `You asked to close this job on ${formatDay(
        job.closureRequest.requestedAt,
      )}. It keeps running until an admin approves the request.`,
    };
  }
  if (job.status === "offer_sent" && job.offer) {
    return {
      severity: "info",
      text: `Offer sent to ${job.offer.caregiverName} — it expires ${relativeDay(
        job.offer.expiresAt,
      )}.`,
    };
  }
  if (job.status === "paused") {
    return {
      severity: "warning",
      text: `Hidden from caregivers since ${formatDay(
        job.pausedAt ?? job.postedAt,
      )}. Resume the job to receive applications again.`,
    };
  }
  if (
    (job.status === "open" || job.status === "interviewing") &&
    job.pipeline.newApplicants > 0
  ) {
    return {
      severity: "info",
      text: `${plural(job.pipeline.newApplicants, "new applicant")} to review.`,
    };
  }
  if (
    job.status === "open" &&
    job.pipeline.applied === 0 &&
    job.pipeline.recommended > 0
  ) {
    return {
      severity: "info",
      text: `No applications yet — invite some of the ${job.pipeline.recommended} recommended caregivers.`,
    };
  }
  return null;
};

export type JobPrimaryAction =
  /** Opens the job page at `section`. */
  | { kind: "open"; label: string; section: JobSection }
  /** Payments are not built yet (a preview notice). */
  | { kind: "pay"; label: string };

/** The main button of a card, by status. */
export const primaryAction = (job: ClientJobOverview): JobPrimaryAction => {
  switch (job.status) {
    case "open":
      if (job.pipeline.applied > 0) {
        return {
          kind: "open",
          label: "Review applicants",
          section: "applicants",
        };
      }
      return job.pipeline.recommended > 0
        ? {
            kind: "open",
            label: "See recommendations",
            section: "recommendations",
          }
        : { kind: "open", label: "View job", section: "overview" };
    case "interviewing":
      return { kind: "open", label: "View candidates", section: "candidates" };
    case "offer_sent":
      return { kind: "open", label: "View offer", section: "offer" };
    case "hired":
      if (
        job.billing &&
        (job.billing.state === "due" || job.billing.state === "overdue")
      ) {
        return { kind: "pay", label: "Pay now" };
      }
      return job.billing?.paymentType === "hourly"
        ? { kind: "open", label: "View timesheet", section: "timesheet" }
        : { kind: "open", label: "View job", section: "overview" };
    case "paused":
      return { kind: "open", label: "Resume job", section: "overview" };
    default:
      return { kind: "open", label: "View job", section: "overview" };
  }
};
