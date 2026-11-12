import type { ReactNode } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import {
  Box,
  Card,
  CardActionArea,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useSeekerOnboardingQuery } from "../../../../queries/client";
import type { JobStartMode } from "./jobStartMode";

type JobStartChooserProps = {
  onChoose: (mode: JobStartMode) => void;
};

const StartOption = ({
  icon,
  title,
  description,
  note,
  disabled = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  /** Shown under the description, e.g. why the option is unavailable. */
  note?: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <Card
    variant="outlined"
    sx={{
      height: "100%",
      borderRadius: 3,
      borderWidth: 2,
      transition: "border-color 120ms",
      "&:hover": disabled ? undefined : { borderColor: "primary.main" },
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <CardActionArea
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: "100%",
        p: { xs: 2.5, md: 3 },
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        <Box sx={{ color: "primary.main", mt: 0.25 }}>{icon}</Box>
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          <Typography variant="h6" component="h2" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          {note ? (
            <Typography variant="caption" color="text.secondary">
              {note}
            </Typography>
          ) : null}
        </Stack>
        <ChevronRightIcon color="action" sx={{ alignSelf: "center" }} />
      </Stack>
    </CardActionArea>
  </Card>
);

/**
 * `/jobs/new` without a mode ("Add New Job"): start from the account's
 * registration answers, or from an empty form. Registration skips this and
 * opens the prefilled post directly. Prefilling needs saved care needs, so
 * it is unavailable for accounts that have none (e.g. registered for
 * oneself); the onboarding status is already cached by the route guard.
 */
const JobStartChooser = ({ onChoose }: JobStartChooserProps) => {
  const { data: queryData } = useSeekerOnboardingQuery();
  const canPrefill = Boolean(
    queryData?.careFor === "other" && queryData.carePreferences,
  );
  const recipientName = queryData?.careRecipient?.name;

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 960 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Add a new job
          </Typography>
          <Typography color="text.secondary">
            How would you like to start? You can change everything before the
            job is posted.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StartOption
            icon={<AutoAwesomeOutlinedIcon />}
            title="Prefill with account info"
            description={`Start from what you told us${
              recipientName ? ` about ${recipientName}` : ""
            } when you registered: location, care needs and schedule, with a suggested title and description.`}
            note={
              canPrefill
                ? undefined
                : "Not available yet: your account has no saved care needs to prefill from."
            }
            disabled={!canPrefill}
            onClick={() => onChoose("prefill")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StartOption
            icon={<NoteAddOutlinedIcon />}
            title="Create a new post"
            description="Start with an empty form — for example for a different kind of help than your registration describes."
            onClick={() => onChoose("blank")}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default JobStartChooser;
