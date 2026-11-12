import type { ReactNode } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";

/** Shared by the job pages: back link, loading, not found, load error. */

export const cardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
} as const;

/** Back to the list — the filtered view it was opened from, if any. */
export const BackToOpenJobs = () => {
  const backTo = (useLocation().state as { backTo?: string } | null)?.backTo;
  return (
    <Button
      component={RouterLink}
      to={backTo ?? SEEKER_ROUTE_PATHS[SeekerRoute.Jobs]}
      startIcon={<ArrowBackIcon />}
      size="small"
      sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
    >
      Open jobs
    </Button>
  );
};

export const JobLoading = () => (
  <Stack alignItems="center" py={10}>
    <CircularProgress />
  </Stack>
);

export const JobMessage = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Stack spacing={2} sx={{ maxWidth: 960 }}>
    <BackToOpenJobs />
    <Paper elevation={0} sx={cardSx}>
      <Stack spacing={1.5}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          {title}
        </Typography>
        {children}
      </Stack>
    </Paper>
  </Stack>
);

export const JobNotFound = () => (
  <JobMessage title="Job not found">
    <Typography color="text.secondary">
      This job does not exist or is no longer available.
    </Typography>
  </JobMessage>
);

export const JobLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <Stack spacing={2} sx={{ maxWidth: 960 }}>
    <BackToOpenJobs />
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      Could not load this job.
    </Alert>
  </Stack>
);
