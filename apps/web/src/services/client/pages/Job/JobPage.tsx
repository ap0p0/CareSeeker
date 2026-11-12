import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  canEditJob,
  isFinishedJob,
  useClientJobDetailsQuery,
  useResumeClientJobMutation,
} from "../../../../queries/client";
import CloseJobDialog from "../OpenJobs/CloseJobDialog";
import { formatDay } from "../OpenJobs/jobOverviewDisplay";
import CarePreferencesCard from "../Review/sections/CarePreferencesCard";
import { PauseJobDialog, QuickEditDialog } from "./JobDialogs";
import { JobLoadError, JobLoading, JobNotFound } from "./JobStates";
import { sectionAnchor } from "./jobDetailsDisplay";
import {
  editJobPath,
  jobPath,
  parseJobSection,
  type JobSection,
} from "./jobLinks";
import ActivityCard from "./sections/ActivityCard";
import {
  ContractCard,
  PaymentsCard,
  TimesheetCard,
} from "./sections/HiredSections";
import {
  ApplicantsCard,
  HiringFunnelCard,
  OfferCard,
} from "./sections/HiringSections";
import JobActionsBar from "./sections/JobActionsBar";
import JobSidePanel from "./sections/JobSidePanel";
import JobSummaryCard from "./sections/JobSummaryCard";

/** Navigation state other pages use to confirm something here. */
export type JobPageLocationState = { flash?: string; backTo?: string } | null;

type OpenDialog = "quick_edit" | "pause" | "close" | null;

/**
 * `/jobs/:jobId` — the seeker's page for one of their jobs, found by its
 * public `jobId`.
 *
 * - Top: back to the list, the job link, pause / resume and close (or a
 *   closure request), following `jobPolicies`.
 * - Left: what the job is (with a quick edit while open), then what
 *   matters in its state — hiring progress, an open offer and the
 *   applicants while looking for a caregiver; the contract, payments and
 *   timesheet once hired — and the full requirements.
 * - Right: messages, AI-picked caregivers, interviews and the activity.
 *
 * `?section=` (from the open jobs cards) scrolls to and highlights the part
 * a button was about. Real jobs come from the API — their candidates,
 * messages and payments are empty until those features exist; a demo
 * session shows the sample data (`jobDetailsMock.ts`). Messaging,
 * invitations, interviews, offers and payments show a notice for now.
 */
const JobPage = () => {
  const { jobId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const section = parseJobSection(searchParams);
  const detailsQuery = useClientJobDetailsQuery(jobId);
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = detailsQuery;
  const resumeMutation = useResumeClientJobMutation();
  // Wide screens: activity under the right column; phones: at the end.
  const wide = useMediaQuery(useTheme().breakpoints.up("lg"));
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [message, setMessage] = useState<string | null>(
    () => (location.state as JobPageLocationState)?.flash ?? null,
  );
  const [highlighted, setHighlighted] = useState<JobSection | null>(
    section === "overview" ? null : section,
  );
  const loaded = Boolean(queryData);

  // Show a confirmation from the previous page once (not after a reload).
  useEffect(() => {
    const state = location.state as JobPageLocationState;
    if (state?.flash) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: { ...state, flash: undefined },
      });
    }
  }, [location, navigate]);

  // Deep link: bring the requested part into view, then fade the highlight.
  useEffect(() => {
    if (!loaded || section === "overview") return;
    document
      .getElementById(sectionAnchor(section))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    const timer = window.setTimeout(() => setHighlighted(null), 2500);
    return () => window.clearTimeout(timer);
  }, [loaded, section]);

  if (isLoadingQuery) return <JobLoading />;
  if (isErrorQuery) {
    return <JobLoadError onRetry={() => void detailsQuery.refetch()} />;
  }
  if (!queryData) return <JobNotFound />;

  const details = queryData;
  const { job } = details;
  const hired = job.status === "hired";
  const finished = isFinishedJob(job);
  const preview = (action: string) =>
    setMessage(
      `“${action}” is not available yet — this page shows sample data.`,
    );
  const done = (text: string) => {
    setDialog(null);
    setMessage(text);
  };
  const editRequirements = () =>
    navigate(editJobPath(job.jobId), {
      state: { returnTo: jobPath(job.jobId) },
    });

  const resume = async () => {
    try {
      await resumeMutation.mutateAsync({ jobId: job.jobId });
      setMessage(`“${job.title}” is open again.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : "Could not resume the job.",
      );
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${jobPath(job.jobId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Job link copied.");
    } catch {
      setMessage(`Job link: ${url}`);
    }
  };

  const sectionProps = { details, highlighted, onPreview: preview };

  return (
    <Stack spacing={2}>
      <JobActionsBar
        job={job}
        onPause={() => setDialog("pause")}
        onResume={() => void resume()}
        onClose={() => setDialog("close")}
        onCopyLink={() => void copyLink()}
        busy={resumeMutation.isPending}
      />

      {job.status === "paused" ? (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void resume()}
              disabled={resumeMutation.isPending}
            >
              Resume
            </Button>
          }
        >
          This job is paused
          {job.pausedAt ? ` since ${formatDay(job.pausedAt)}` : ""} — caregivers
          can’t find it or apply.
        </Alert>
      ) : null}
      {job.closureRequest?.state === "pending" ? (
        <Alert severity="info">
          You asked to close this job on{" "}
          {formatDay(job.closureRequest.requestedAt)}. It keeps running until an
          admin approves the request.
        </Alert>
      ) : null}
      {finished ? (
        <Alert severity="info">
          This job is{" "}
          {job.status === "closed" ? "closed and in your archive" : job.status}
          {job.closedAt ? ` since ${formatDay(job.closedAt)}` : ""}. It can no
          longer be changed.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "minmax(0, 2fr) minmax(0, 1fr)",
          },
          // Phones: summary → messages / candidates → details → activity.
          gridTemplateRows: { lg: "auto 1fr" },
          gridTemplateAreas: {
            xs: `"summary" "side" "main" "activity"`,
            lg: `"summary side" "main side"`,
          },
        }}
      >
        <Box sx={{ gridArea: "summary" }}>
          <JobSummaryCard
            job={job}
            views={details.views}
            onQuickEdit={() => setDialog("quick_edit")}
            highlighted={highlighted === "overview"}
          />
        </Box>

        <Stack spacing={2} sx={{ gridArea: "side" }}>
          <JobSidePanel {...sectionProps} />
          {wide ? <ActivityCard activity={details.activity} /> : null}
        </Stack>

        <Stack spacing={2} sx={{ gridArea: "main" }}>
          {hired ? (
            <>
              <ContractCard {...sectionProps} />
              <PaymentsCard {...sectionProps} />
              <TimesheetCard {...sectionProps} />
            </>
          ) : (
            <>
              <HiringFunnelCard details={details} />
              <OfferCard {...sectionProps} />
              <ApplicantsCard {...sectionProps} />
            </>
          )}
          <CarePreferencesCard
            title="Job requirements"
            preferences={job.details}
            onEdit={canEditJob(job) ? editRequirements : undefined}
          />
        </Stack>

        {wide ? null : (
          <Box sx={{ gridArea: "activity" }}>
            <ActivityCard activity={details.activity} />
          </Box>
        )}
      </Box>

      {dialog === "quick_edit" ? (
        <QuickEditDialog
          job={job}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      ) : null}
      {dialog === "pause" ? (
        <PauseJobDialog
          job={job}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      ) : null}
      {dialog === "close" ? (
        <CloseJobDialog
          job={job}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      ) : null}

      <Snackbar
        open={message !== null}
        autoHideDuration={5000}
        onClose={() => setMessage(null)}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 80, md: 24 } }}
      />
    </Stack>
  );
};

export default JobPage;
