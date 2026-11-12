import type { ReactNode } from "react";
import { useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Link,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  canPauseJob,
  canResumeJob,
  closureRequestsAvailable,
  editLockedReason,
  pauseLockedReason,
  jobClosurePolicy,
  type ClientJobOverview,
  type HiredCaregiver,
} from "../../../../queries/client";
import { editJobPath, jobPath } from "../Job/jobLinks";
import JobBillingPanel from "./JobBillingPanel";
import {
  budgetLabel,
  formatDay,
  JOB_STATUS_META,
  jobAttention,
  postedLabel,
  primaryAction,
  scheduleLabel,
  visitLabel,
} from "./jobOverviewDisplay";

type JobOverviewCardProps = {
  job: ClientJobOverview;
  /** "Close job" / "Request to close job" — the page opens the dialog. */
  onCloseJob: (job: ClientJobOverview) => void;
  onPauseJob: (job: ClientJobOverview) => void;
  onResumeJob: (job: ClientJobOverview) => void;
  /** Actions that are not built yet (paying): a notice. */
  onPreviewAction: (action: string, job: ClientJobOverview) => void;
};

const clampLines = (lines: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
});

/** Icon + text line under the title (schedule, place, budget). */
const MetaItem = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: string;
}) => (
  <Stack
    direction="row"
    spacing={0.5}
    alignItems="center"
    sx={{ color: "text.secondary", minWidth: 0 }}
  >
    <Box
      sx={{
        display: "flex",
        alignSelf: "flex-start",
        mt: "1px",
        "& svg": { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2">{children}</Typography>
  </Stack>
);

/** One number of the hiring funnel. */
const Metric = ({
  icon,
  label,
  value,
  extra,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  extra?: ReactNode;
}) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      p: 1.25,
      borderRadius: 2,
      bgcolor: "grey.50",
      border: "1px solid",
      borderColor: "divider",
      // Labels may wrap on phones; keep the numbers on one baseline.
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{
        color: "text.secondary",
        "& svg": { fontSize: 16, display: { xs: "none", sm: "block" } },
      }}
    >
      {icon}
      <Typography variant="caption" lineHeight={1.3}>
        {label}
      </Typography>
    </Stack>
    <Stack direction="row" spacing={0.75} alignItems="center" mt={0.25}>
      <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
        {value}
      </Typography>
      {extra}
    </Stack>
  </Box>
);

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The caregiver working on a hired job. */
const CaregiverRow = ({ caregiver }: { caregiver: HiredCaregiver }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Avatar sx={{ bgcolor: "primary.light", fontWeight: 700 }}>
      {initials(caregiver.name)}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Typography variant="subtitle2" fontWeight={700} noWrap>
          {caregiver.name}
        </Typography>
        {caregiver.rating !== null ? (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ color: "warning.main" }}
          >
            <StarRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" color="text.primary" fontWeight={600}>
              {caregiver.rating.toFixed(1)}
            </Typography>
          </Stack>
        ) : (
          <Chip label="New" size="small" variant="outlined" />
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Caregiver since {formatDay(caregiver.startedOn)}
        {caregiver.nextVisitAt
          ? ` · Next visit: ${visitLabel(caregiver.nextVisitAt)}`
          : ""}
      </Typography>
    </Box>
  </Stack>
);

/**
 * A job on the open jobs page: status, title, schedule / place / budget,
 * short description, then either the hiring funnel (AI recommendations,
 * applicants, interviews) or — once hired — the caregiver and what is owed.
 */
const JobOverviewCard = ({
  job,
  onCloseJob,
  onPauseJob,
  onResumeJob,
  onPreviewAction,
}: JobOverviewCardProps) => {
  const location = useLocation();
  // Job pages link back to this exact view (filters included).
  const linkState = { backTo: `${location.pathname}${location.search}` };
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const meta = JOB_STATUS_META[job.status];
  const attention = jobAttention(job);
  const hired = job.status === "hired" && job.caregiver;
  const paused = job.status === "paused";
  const titleId = `job-${job.jobId}-title`;
  const action = primaryAction(job);
  const editLocked = editLockedReason(job);
  const closurePolicy = jobClosurePolicy(job);
  const closeMenu = () => setMenuAnchor(null);

  return (
    <Card
      variant="outlined"
      component="article"
      aria-labelledby={titleId}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        transition: "box-shadow 150ms, border-color 150ms",
        "&:hover": { borderColor: "primary.light", boxShadow: 2 },
      }}
    >
      <CardContent sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.75}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
              <Tooltip title={meta.hint}>
                <Chip
                  label={meta.label}
                  color={meta.color}
                  size="small"
                  variant={paused ? "outlined" : "filled"}
                  sx={{ fontWeight: 700 }}
                />
              </Tooltip>
              <Typography variant="caption" color="text.secondary" noWrap>
                {postedLabel(job.postedAt)}
              </Typography>
            </Stack>
            <IconButton
              size="small"
              aria-label={`More actions for ${job.title}`}
              aria-haspopup="menu"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                component={RouterLink}
                to={jobPath(job.jobId)}
                state={linkState}
                onClick={closeMenu}
              >
                View job post
              </MenuItem>
              {editLocked ? (
                <MenuItem disabled sx={{ whiteSpace: "normal", maxWidth: 280 }}>
                  <ListItemText
                    primary="Edit job"
                    secondary={editLocked}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </MenuItem>
              ) : (
                <MenuItem
                  component={RouterLink}
                  to={editJobPath(job.jobId)}
                  state={{ returnTo: linkState.backTo }}
                  onClick={closeMenu}
                >
                  Edit job
                </MenuItem>
              )}
              {canResumeJob(job) ? (
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onResumeJob(job);
                  }}
                >
                  Resume job
                </MenuItem>
              ) : canPauseJob(job) ? (
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onPauseJob(job);
                  }}
                >
                  Pause job
                </MenuItem>
              ) : (
                <MenuItem disabled sx={{ whiteSpace: "normal", maxWidth: 280 }}>
                  <ListItemText
                    primary="Pause job"
                    secondary={pauseLockedReason(job)}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </MenuItem>
              )}
              {closurePolicy === "not_allowed" ? (
                <MenuItem disabled sx={{ whiteSpace: "normal", maxWidth: 280 }}>
                  <ListItemText
                    primary="Close job"
                    secondary="Closure requested — waiting for an admin."
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onCloseJob(job);
                  }}
                  sx={{ color: "error.main" }}
                >
                  {closurePolicy === "request_approval" &&
                  closureRequestsAvailable()
                    ? "Request to close job…"
                    : "Close job"}
                </MenuItem>
              )}
            </Menu>
          </Stack>

          <Box>
            <Typography
              id={titleId}
              variant="h6"
              component="h2"
              fontWeight={700}
              lineHeight={1.3}
              sx={clampLines(2)}
            >
              <Link
                component={RouterLink}
                to={jobPath(job.jobId)}
                state={linkState}
                color="inherit"
                underline="hover"
              >
                {job.title}
              </Link>
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              columnGap={2}
              rowGap={0.5}
              mt={0.75}
            >
              <MetaItem icon={<EventRepeatOutlinedIcon />}>
                {scheduleLabel(job)}
              </MetaItem>
              <MetaItem icon={<PlaceOutlinedIcon />}>
                {`${job.city}, ${job.state}`}
              </MetaItem>
              <MetaItem icon={<PaymentsOutlinedIcon />}>
                {budgetLabel(job)}
              </MetaItem>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={clampLines(3)}>
            {job.description}
          </Typography>

          {hired && job.caregiver ? (
            <Stack spacing={1.5}>
              <CaregiverRow caregiver={job.caregiver} />
              {job.billing ? (
                <JobBillingPanel
                  billing={job.billing}
                  caregiverName={job.caregiver.name}
                />
              ) : null}
            </Stack>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{ opacity: paused ? 0.55 : 1 }}
              aria-label="Hiring progress"
            >
              <Metric
                icon={<AutoAwesomeOutlinedIcon />}
                label="AI recommended"
                value={job.pipeline.recommended}
              />
              <Metric
                icon={<GroupsOutlinedIcon />}
                label="Applied"
                value={job.pipeline.applied}
                extra={
                  job.pipeline.newApplicants > 0 ? (
                    <Chip
                      label={`+${job.pipeline.newApplicants} new`}
                      color="success"
                      size="small"
                      sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                    />
                  ) : null
                }
              />
              <Metric
                icon={<HowToRegOutlinedIcon />}
                label="Interviewing"
                value={job.pipeline.interviewing}
              />
            </Stack>
          )}

          {attention ? (
            <Alert
              severity={attention.severity}
              variant="standard"
              sx={{ py: 0, "& .MuiAlert-message": { py: 0.75 } }}
            >
              {attention.text}
            </Alert>
          ) : null}
        </Stack>
      </CardContent>

      <Divider />
      <CardActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Button
          size="small"
          color="inherit"
          component={RouterLink}
          to={jobPath(job.jobId, "messages")}
          state={linkState}
          aria-label={
            job.unreadMessages > 0
              ? `Messages, ${job.unreadMessages} unread`
              : "Messages"
          }
          startIcon={<ChatBubbleOutlineIcon fontSize="small" />}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Messages
          {job.unreadMessages > 0 ? (
            <Box
              component="span"
              aria-hidden
              sx={{
                ml: 0.75,
                px: 0.75,
                minWidth: 20,
                lineHeight: "20px",
                borderRadius: 999,
                bgcolor: "error.main",
                color: "common.white",
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {job.unreadMessages > 9 ? "9+" : job.unreadMessages}
            </Box>
          ) : null}
        </Button>
        {action.kind === "pay" ? (
          <Button
            variant="contained"
            color={job.billing?.state === "overdue" ? "error" : "primary"}
            size="small"
            onClick={() => onPreviewAction(action.label, job)}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
            }}
          >
            {action.label}
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to={jobPath(job.jobId, action.section)}
            state={linkState}
            variant={paused ? "outlined" : "contained"}
            size="small"
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
            }}
          >
            {action.label}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default JobOverviewCard;
