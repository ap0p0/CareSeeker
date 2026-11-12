import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { alpha } from "@mui/material/styles";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  useClientOpenJobsQuery,
  useResumeClientJobMutation,
  type ClientJobOverview,
} from "../../../../queries/client";
import { PauseJobDialog } from "../Job/JobDialogs";
import { newJobPath } from "../NewJob/jobStartMode";
import CloseJobDialog from "./CloseJobDialog";
import JobOverviewCard from "./JobOverviewCard";
import {
  JOB_STATUS_META,
  OPEN_JOB_STATUS_ORDER,
  plural,
} from "./jobOverviewDisplay";
import {
  SUMMARY_FILTERS,
  describeFilter,
  matchesFilter,
  parseJobsFilter,
  sameFilter,
  withJobsFilter,
  type JobsFilter,
  type SummaryFilter,
} from "./jobsFilter";

/** Navigation state other pages use to confirm something here. */
export type OpenJobsLocationState = { flash?: string } | null;

const cardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
} as const;

const pillButton = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
} as const;

/** A summary number above the cards; clicking it filters the cards. */
const SummaryTile = ({
  icon,
  label,
  value,
  hint,
  tone = "text.primary",
  selected,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
  tone?: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Card
    variant="outlined"
    sx={(theme) => ({
      height: "100%",
      borderRadius: 3,
      borderWidth: 2,
      borderColor: selected ? "primary.main" : "divider",
      bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : undefined,
      transition: "border-color 120ms, background-color 120ms",
      "&:hover": { borderColor: selected ? "primary.main" : "primary.light" },
    })}
  >
    <CardActionArea
      onClick={onClick}
      // Nothing to show behind an empty tile (unless it is the active filter).
      disabled={value === 0 && !selected}
      aria-pressed={selected}
      sx={{ height: "100%", p: 2, display: "block" }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        color={selected ? "primary.main" : "text.secondary"}
      >
        {icon}
        <Typography variant="body2" fontWeight={selected ? 700 : 400}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" fontWeight={700} color={tone} mt={0.5}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    </CardActionArea>
  </Card>
);

const summarize = (jobs: ClientJobOverview[]) => {
  const count = (filter: SummaryFilter) =>
    jobs.filter(SUMMARY_FILTERS[filter].matches).length;
  const sum = (pick: (job: ClientJobOverview) => number) =>
    jobs.reduce((total, job) => total + pick(job), 0);
  return {
    active: count("active"),
    paused: jobs.filter((job) => job.status === "paused").length,
    hired: jobs.filter((job) => job.status === "hired").length,
    newApplicants: sum((job) => job.pipeline.newApplicants),
    jobsWithNewApplicants: count("new_applicants"),
    interviewing: sum((job) =>
      SUMMARY_FILTERS.interviewing.matches(job) ? job.pipeline.interviewing : 0,
    ),
    jobsInterviewing: count("interviewing"),
    paymentsDue: count("payments_due"),
    overdue: jobs.filter((job) => job.billing?.state === "overdue").length,
  };
};

const LoadingCards = () => (
  <Grid container spacing={2}>
    {[0, 1, 2, 3].map((index) => (
      <Grid key={index} size={{ xs: 12, lg: 6 }}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" width={90} height={24} />
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rounded" height={56} />
              <Stack direction="row" spacing={1}>
                {[0, 1, 2].map((metric) => (
                  <Skeleton
                    key={metric}
                    variant="rounded"
                    height={64}
                    sx={{ flex: 1 }}
                  />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

/**
 * `/jobs` — the seeker's jobs that are still running: posted and looking
 * for a caregiver (open, interviewing, offer sent, paused) or with a
 * caregiver at work (hired). Finished jobs (completed / cancelled / closed)
 * are not listed here. The summary tiles and the status chips filter the
 * cards (`?show=` / `?status=`). Cards link to each job's page, open jobs
 * can be edited, and closing follows `jobPolicies` (open: right away;
 * otherwise a request with a reason for an admin). Real jobs come from
 * the API; a demo session shows the sample data (`jobsService`). Paying is
 * a preview. `?preview=empty` shows the empty page in a demo.
 */
const OpenJobsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = parseJobsFilter(searchParams);
  const jobsQuery = useClientOpenJobsQuery({
    empty: searchParams.get("preview") === "empty",
  });
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = jobsQuery;
  // A confirmation from the page we came from (e.g. "changes saved").
  const [message, setMessage] = useState<string | null>(
    () => (location.state as OpenJobsLocationState)?.flash ?? null,
  );
  const [closingJob, setClosingJob] = useState<ClientJobOverview | null>(null);
  const [pausingJob, setPausingJob] = useState<ClientJobOverview | null>(null);
  const resumeMutation = useResumeClientJobMutation();

  // Show the confirmation once: not again after a reload / back.
  useEffect(() => {
    if ((location.state as OpenJobsLocationState)?.flash) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  const jobs = useMemo(() => queryData ?? [], [queryData]);
  const summary = useMemo(() => summarize(jobs), [jobs]);
  const statusCounts = useMemo(
    () =>
      OPEN_JOB_STATUS_ORDER.map((status) => ({
        status,
        count: jobs.filter((job) => job.status === status).length,
      })).filter((entry) => entry.count > 0),
    [jobs],
  );
  const visibleJobs = jobs.filter((job) => matchesFilter(job, filter));

  /** Filters replace the history entry: Back leaves the page, not the filter. */
  const applyFilter = (next: JobsFilter) =>
    setSearchParams(withJobsFilter(searchParams, next), { replace: true });
  /** Tiles toggle: clicking the active tile shows everything again. */
  const toggleSummary = (summary: SummaryFilter) => {
    const next: JobsFilter = { kind: "summary", summary };
    applyFilter(sameFilter(filter, next) ? { kind: "all" } : next);
  };
  const summarySelected = (summary: SummaryFilter) =>
    filter.kind === "summary" && filter.summary === summary;

  const resumeJob = async (job: ClientJobOverview) => {
    try {
      await resumeMutation.mutateAsync({ jobId: job.jobId });
      setMessage(`“${job.title}” is open again.`);
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : "Could not resume the job.",
      );
    }
  };

  const showPreview = (action: string, job: ClientJobOverview) =>
    setMessage(
      `“${action}” for “${job.title}” is not available yet — this page shows sample data.`,
    );

  const addJobButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate(newJobPath())}
      sx={{ ...pillButton, flexShrink: 0 }}
    >
      Add new job
    </Button>
  );

  return (
    <Stack spacing={2.5}>
      <Paper elevation={0} sx={cardSx}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Open jobs
            </Typography>
            <Typography color="text.secondary">
              Your jobs that are still running — finding a caregiver or with a
              caregiver at work. Finished jobs move to History.
            </Typography>
          </Stack>
          {addJobButton}
        </Stack>
      </Paper>

      {isLoadingQuery ? (
        <LoadingCards />
      ) : isErrorQuery ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void jobsQuery.refetch()}
            >
              Retry
            </Button>
          }
        >
          Could not load your jobs.
        </Alert>
      ) : jobs.length === 0 ? (
        <Paper elevation={0} sx={{ ...cardSx, py: { xs: 5, md: 7 } }}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                backgroundColor: "rgba(37, 99, 235, 0.08)",
              }}
            >
              <WorkOutlineIcon fontSize="large" />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              No open jobs
            </Typography>
            <Typography color="text.secondary" maxWidth={440}>
              Post a job and we will recommend caregivers who fit. Applicants,
              interviews and payments will show up here.
            </Typography>
            {addJobButton}
          </Stack>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile
                icon={<WorkOutlineIcon fontSize="small" />}
                label="Active jobs"
                value={summary.active}
                selected={summarySelected("active")}
                onClick={() => toggleSummary("active")}
                hint={
                  summary.paused > 0
                    ? `${summary.hired} with a caregiver · ${summary.paused} paused`
                    : `${summary.hired} with a caregiver`
                }
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile
                icon={<GroupsOutlinedIcon fontSize="small" />}
                label="New applicants"
                value={summary.newApplicants}
                selected={summarySelected("new_applicants")}
                onClick={() => toggleSummary("new_applicants")}
                hint={
                  summary.newApplicants > 0
                    ? `Waiting for your review · ${plural(summary.jobsWithNewApplicants, "job")}`
                    : "Waiting for your review"
                }
                tone={summary.newApplicants > 0 ? "success.main" : undefined}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile
                icon={<HowToRegOutlinedIcon fontSize="small" />}
                label="Interviewing"
                value={summary.interviewing}
                selected={summarySelected("interviewing")}
                onClick={() => toggleSummary("interviewing")}
                hint={
                  summary.interviewing > 0
                    ? `Candidates in interviews · ${plural(summary.jobsInterviewing, "job")}`
                    : "Candidates in interviews"
                }
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <SummaryTile
                icon={<ReceiptLongOutlinedIcon fontSize="small" />}
                label="Payments due"
                value={summary.paymentsDue}
                selected={summarySelected("payments_due")}
                onClick={() => toggleSummary("payments_due")}
                hint={
                  summary.overdue > 0
                    ? `${plural(summary.overdue, "payment")} overdue`
                    : "Nothing overdue"
                }
                tone={summary.overdue > 0 ? "error.main" : undefined}
              />
            </Grid>
          </Grid>

          <Stack
            direction="row"
            spacing={1}
            role="group"
            aria-label="Filter jobs by status"
            sx={{ overflowX: "auto", pb: 0.5 }}
          >
            {[
              { status: "all" as const, count: jobs.length },
              ...statusCounts,
            ].map(({ status, count }) => {
              const selected =
                status === "all"
                  ? filter.kind === "all"
                  : filter.kind === "status" && filter.status === status;
              return (
                <Chip
                  key={status}
                  label={`${status === "all" ? "All" : JOB_STATUS_META[status].label} (${count})`}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() =>
                    applyFilter(
                      status === "all"
                        ? { kind: "all" }
                        : { kind: "status", status },
                    )
                  }
                  aria-pressed={selected}
                  sx={{ fontWeight: 600, flexShrink: 0 }}
                />
              );
            })}
          </Stack>

          {filter.kind !== "all" ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              role="status"
            >
              <Typography variant="body2" color="text.secondary">
                Showing {plural(visibleJobs.length, "job")} ·{" "}
                {describeFilter(filter)}
              </Typography>
              <Button
                size="small"
                onClick={() => applyFilter({ kind: "all" })}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Show all jobs
              </Button>
            </Stack>
          ) : null}

          {visibleJobs.length === 0 ? (
            <Paper elevation={0} sx={{ ...cardSx, textAlign: "center" }}>
              <Typography color="text.secondary">
                No {describeFilter(filter)} right now.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {visibleJobs.map((job) => (
                <Grid key={job.jobId} size={{ xs: 12, lg: 6 }}>
                  <JobOverviewCard
                    job={job}
                    onCloseJob={setClosingJob}
                    onPauseJob={setPausingJob}
                    onResumeJob={(job) => void resumeJob(job)}
                    onPreviewAction={showPreview}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {pausingJob ? (
        <PauseJobDialog
          key={pausingJob.jobId}
          job={pausingJob}
          onClose={() => setPausingJob(null)}
          onDone={(done) => {
            setPausingJob(null);
            setMessage(done);
          }}
        />
      ) : null}

      {closingJob ? (
        <CloseJobDialog
          key={closingJob.jobId}
          job={closingJob}
          onClose={() => setClosingJob(null)}
          onDone={(done) => {
            setClosingJob(null);
            setMessage(done);
          }}
        />
      ) : null}

      <Snackbar
        open={message !== null}
        autoHideDuration={5000}
        onClose={() => setMessage(null)}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        // Above the bottom navigation on phones.
        sx={{ bottom: { xs: 80, md: 24 } }}
      />
    </Stack>
  );
};

export default OpenJobsPage;
