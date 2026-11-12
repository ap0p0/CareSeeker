import type { ReactElement } from "react";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import LinkIcon from "@mui/icons-material/Link";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { Box, Button, CircularProgress, Stack, Tooltip } from "@mui/material";
import {
  canPauseJob,
  canResumeJob,
  closureRequestsAvailable,
  isFinishedJob,
  jobClosurePolicy,
  pauseLockedReason,
  type ClientJobOverview,
} from "../../../../../queries/client";
import { BackToOpenJobs } from "../JobStates";

type JobActionsBarProps = {
  job: ClientJobOverview;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onCopyLink: () => void;
  /** Pause / resume in flight. */
  busy: boolean;
};

const pill = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
} as const;

/** A disabled button still explains itself on hover / focus. */
const WithReason = ({
  reason,
  children,
}: {
  reason: string | null;
  children: ReactElement;
}) =>
  reason ? (
    <Tooltip title={reason}>
      <Box component="span" tabIndex={0} sx={{ display: "inline-flex" }}>
        {children}
      </Box>
    </Tooltip>
  ) : (
    children
  );

/**
 * Above the job: back to the list, the job's link, and the job-level
 * actions — pause / resume and close (or request closing), following
 * `jobPolicies`. Finished jobs only keep the link.
 */
const JobActionsBar = ({
  job,
  onPause,
  onResume,
  onClose,
  onCopyLink,
  busy,
}: JobActionsBarProps) => {
  const finished = isFinishedJob(job);
  const closure = jobClosurePolicy(job);
  const paused = canResumeJob(job);

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ sm: "center" }}
      justifyContent="space-between"
      spacing={1}
    >
      <BackToOpenJobs />
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        justifyContent={{ xs: "flex-start", sm: "flex-end" }}
      >
        <Button
          size="small"
          startIcon={<LinkIcon />}
          onClick={onCopyLink}
          sx={{ ...pill, fontWeight: 600 }}
        >
          Copy job link
        </Button>
        {finished ? null : (
          <>
            {paused ? (
              <Button
                size="small"
                variant="contained"
                onClick={onResume}
                disabled={busy}
                startIcon={
                  busy ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PlayCircleOutlineIcon />
                  )
                }
                sx={pill}
              >
                Resume job
              </Button>
            ) : (
              <WithReason reason={pauseLockedReason(job)}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onPause}
                  disabled={busy || !canPauseJob(job)}
                  startIcon={
                    busy ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <PauseCircleOutlineIcon />
                    )
                  }
                  sx={pill}
                >
                  Pause job
                </Button>
              </WithReason>
            )}
            <WithReason
              reason={
                closure === "not_allowed"
                  ? "You already asked to close this job — an admin is reviewing it."
                  : null
              }
            >
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={onClose}
                disabled={closure === "not_allowed"}
                startIcon={<ArchiveOutlinedIcon />}
                sx={pill}
              >
                {closure === "request_approval" && closureRequestsAvailable()
                  ? "Request to close"
                  : closure === "not_allowed"
                    ? "Closure requested"
                    : "Close job"}
              </Button>
            </WithReason>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default JobActionsBar;
