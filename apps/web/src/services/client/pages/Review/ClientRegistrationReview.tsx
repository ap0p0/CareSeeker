import type { ReactNode } from "react";
import { useState } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";
import {
  useConfirmSeekerProfileMutation,
  useSeekerOnboardingQuery,
} from "../../../../queries/client";
import { ClientAuthLoadingScreen, useClientAuth } from "../../auth";
import {
  CarePreferencesEditor,
  CareRecipientEditor,
  RegistrantEditor,
} from "../../components/profile-editors";
import { newJobPath } from "../NewJob/jobStartMode";
import CarePreferencesCard from "./sections/CarePreferencesCard";
import CareRecipientCard from "./sections/CareRecipientCard";
import RegistrantCard from "./sections/RegistrantCard";

type EditableSection = "registrant" | "recipient" | "preferences";

const EDITOR_TITLES: Record<EditableSection, string> = {
  registrant: "Edit your details",
  recipient: "Edit who needs care",
  preferences: "Edit care needs & preferences",
};

/** Card wrapper for an inline editor, with a way back to the summary. */
const EditorCard = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    component="section"
    aria-label={title}
    sx={{
      p: { xs: 2.5, md: 3 },
      borderRadius: 3,
      border: "2px solid",
      borderColor: "primary.light",
    }}
  >
    <Stack spacing={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Button
          size="small"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{ textTransform: "none", flexShrink: 0 }}
        >
          Back to summary
        </Button>
      </Stack>
      {children}
    </Stack>
  </Paper>
);

/**
 * One-time review shown once the on-behalf registration is complete and
 * until the seeker confirms. It is the only page reachable in that state
 * (`RequireSeekerOnboarding` redirects everything else here) and is not
 * reachable afterwards. Each section can be edited in place. Confirming
 * opens the dashboard; "confirm and open a job" additionally takes the
 * seeker to the new-job page, where these answers will prefill the post.
 */
const ClientRegistrationReview = () => {
  const navigate = useNavigate();
  const { signOut } = useClientAuth();
  const onboardingQuery = useSeekerOnboardingQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = onboardingQuery;
  const confirmMutation = useConfirmSeekerProfileMutation();
  const [editing, setEditing] = useState<EditableSection | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"dashboard" | "job" | null>(
    null,
  );
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirm = async (next: "dashboard" | "job") => {
    setConfirmError(null);
    setConfirming(next);
    try {
      await confirmMutation.mutateAsync();
      // Registration opens the job post prefilled from these answers (the
      // app's "Add New Job" asks how to start instead).
      navigate(
        next === "job"
          ? newJobPath("prefill")
          : SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard],
        { replace: true },
      );
    } catch (error) {
      setConfirmError(
        error instanceof Error
          ? error.message
          : "Could not confirm your details. Please try again.",
      );
    } finally {
      setConfirming(null);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Login], { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (isLoadingQuery) {
    return <ClientAuthLoadingScreen />;
  }

  // Every section must exist for the review to make sense.
  const sections =
    queryData?.registrant &&
    queryData.careRecipient &&
    queryData.carePreferences
      ? {
          registrant: queryData.registrant,
          careRecipient: queryData.careRecipient,
          carePreferences: queryData.carePreferences,
        }
      : null;
  const recipientName = sections?.careRecipient.name;
  const closeEditor = () => setEditing(null);
  const editor = (section: EditableSection) => (
    <EditorCard title={EDITOR_TITLES[section]} onClose={closeEditor}>
      {section === "registrant" ? <RegistrantEditor /> : null}
      {section === "recipient" ? <CareRecipientEditor /> : null}
      {section === "preferences" ? (
        <CarePreferencesEditor recipientName={recipientName} />
      ) : null}
    </EditorCard>
  );
  const busy = confirmMutation.isPending;
  const actionsDisabled = editing !== null || !sections || busy;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Room for the fixed confirmation bar (two stacked buttons + note on phones).
        pb: { xs: 44, sm: 24 },
        background:
          "linear-gradient(180deg, rgba(214, 232, 255, 0.42) 0%, rgba(247, 237, 248, 0.66) 100%)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              CareSeeker
            </Typography>
            <Button
              size="small"
              startIcon={<LogoutOutlinedIcon />}
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              sx={{ textTransform: "none" }}
            >
              Log out
            </Button>
          </Stack>

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
              <Chip
                label="Final step"
                color="primary"
                size="small"
                sx={{ alignSelf: "flex-start", fontWeight: 700 }}
              />
              <Typography variant="h4" component="h1" fontWeight={700}>
                Review your details
              </Typography>
              <Typography color="text.secondary">
                Here is everything you told us during registration. Check it
                over, use Edit to fix anything right here, then confirm to open
                your dashboard.
              </Typography>
            </Stack>
          </Paper>

          {isErrorQuery || !sections ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => void onboardingQuery.refetch()}
                >
                  Retry
                </Button>
              }
            >
              {onboardingQuery.error?.message ??
                "Could not load your registration details."}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: editing === "registrant" ? 12 : 5 }}>
                {editing === "registrant" ? (
                  editor("registrant")
                ) : (
                  <RegistrantCard
                    registrant={sections.registrant}
                    onEdit={() => setEditing("registrant")}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, lg: editing === "recipient" ? 12 : 7 }}>
                {editing === "recipient" ? (
                  editor("recipient")
                ) : (
                  <CareRecipientCard
                    recipient={sections.careRecipient}
                    onEdit={() => setEditing("recipient")}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                {editing === "preferences" ? (
                  editor("preferences")
                ) : (
                  <CarePreferencesCard
                    preferences={sections.carePreferences}
                    onEdit={() => setEditing("preferences")}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </Stack>
      </Container>

      {/* Confirmation bar: always visible so the final step is never missed. */}
      <Paper
        elevation={8}
        square
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Stack spacing={1.25}>
            {confirmError ? (
              <Alert severity="error">{confirmError}</Alert>
            ) : null}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                {editing
                  ? "Finish editing (or go back to the summary) before confirming."
                  : "Everything correct? Confirm to finish your registration."}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ flexShrink: 0 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => void handleConfirm("job")}
                  disabled={actionsDisabled}
                  startIcon={
                    confirming === "job" ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <WorkOutlineIcon />
                    )
                  }
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Confirm and open a job now
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => void handleConfirm("dashboard")}
                  disabled={actionsDisabled}
                  startIcon={
                    confirming === "dashboard" ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <CheckCircleOutlineIcon />
                    )
                  }
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Confirm and go to dashboard
                </Button>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="flex-start">
              <InfoOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ mt: "1px", flexShrink: 0 }}
              />
              <Typography variant="caption" color="text.secondary">
                This was your registration only — confirming does not post a job
                yet, so caregivers cannot apply and we will not suggest anyone
                until you open one. Choose “Confirm and open a job now” and we
                will prefill a job post with what you told us; you can edit it
                and add anything else before it goes live.
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Paper>
    </Box>
  );
};

export default ClientRegistrationReview;
