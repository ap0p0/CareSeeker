import type { ReactNode } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  canEditJob,
  editLockedReason,
  isFinishedJob,
  type ClientJobOverview,
} from "../../../../../queries/client";
import {
  budgetLabel,
  JOB_STATUS_META,
  postedLabel,
  scheduleLabel,
} from "../../OpenJobs/jobOverviewDisplay";
import { taskLabels } from "../../Review/labels";
import { sectionAnchor } from "../jobDetailsDisplay";

type JobSummaryCardProps = {
  job: ClientJobOverview;
  /** `null` when views are not tracked (real jobs, for now). */
  views: number | null;
  onQuickEdit: () => void;
  highlighted: boolean;
};

const Meta = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <Stack
    direction="row"
    spacing={0.5}
    alignItems="center"
    sx={{ color: "text.secondary", "& svg": { fontSize: 18 } }}
  >
    {icon}
    <Typography variant="body2">{children}</Typography>
  </Stack>
);

/**
 * Top left of the job page: what the job is — status, title, schedule,
 * place, budget, description and tasks — with a quick edit for open jobs
 * (a lock with the reason otherwise).
 */
const JobSummaryCard = ({
  job,
  views,
  onQuickEdit,
  highlighted,
}: JobSummaryCardProps) => {
  const meta = JOB_STATUS_META[job.status];
  const lockedReason = editLockedReason(job);

  return (
    <Paper
      elevation={0}
      component="section"
      id={sectionAnchor("overview")}
      aria-labelledby="job-title"
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: highlighted ? "primary.main" : "divider",
        height: "100%",
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Tooltip title={meta.hint}>
              <Chip
                label={meta.label}
                color={meta.color}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {postedLabel(job.postedAt)}
            </Typography>
            {views !== null ? (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                color="text.secondary"
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{views} views</Typography>
              </Stack>
            ) : null}
          </Stack>
          {canEditJob(job) ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={onQuickEdit}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              Quick edit
            </Button>
          ) : isFinishedJob(job) ? null : (
            <Tooltip title={lockedReason ?? ""}>
              <Chip
                icon={<LockOutlinedIcon />}
                label="Locked"
                size="small"
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </Stack>

        <Typography
          id="job-title"
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, lineHeight: 1.2 }}
        >
          {job.title}
        </Typography>

        <Stack direction="row" flexWrap="wrap" columnGap={2.5} rowGap={0.5}>
          <Meta icon={<EventRepeatOutlinedIcon />}>{scheduleLabel(job)}</Meta>
          <Meta icon={<PlaceOutlinedIcon />}>
            {job.city}, {job.state} {job.postalCode}
          </Meta>
          <Meta icon={<PaymentsOutlinedIcon />}>{budgetLabel(job)}</Meta>
        </Stack>

        <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
          {job.description}
        </Typography>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            component="div"
            mb={0.75}
          >
            Help needed
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
            {taskLabels(job.details.careTasks).map((task) => (
              <Chip key={task} label={task} size="small" />
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Job ID{" "}
          <Box
            component="span"
            sx={{ fontFamily: "monospace", color: "text.primary" }}
          >
            {job.jobId}
          </Box>
        </Typography>
      </Stack>
    </Paper>
  );
};

export default JobSummaryCard;
