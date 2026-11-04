import type { ReactNode } from "react";
import { useState } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
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
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import {
  useConfirmProviderProfileMutation,
  useProviderOverviewQuery,
} from "../../../../queries/provider";
import { ProviderAuthLoadingScreen, useProviderAuth } from "../../auth";
import { ProviderErrorAlert } from "../../components";
import {
  AvailabilityEditor,
  PersonalInfoEditor,
  ServicesEditor,
} from "../../components/profile-editors";
import ProviderDocumentsStep from "../Register/steps/ProviderDocumentsStep";
import AvailabilityCard from "./sections/AvailabilityCard";
import CompensationTravelCard from "./sections/CompensationTravelCard";
import DocumentsCard from "./sections/DocumentsCard";
import ProfileSummaryCard from "./sections/ProfileSummaryCard";
import ServicesCard from "./sections/ServicesCard";

type EditableSection = "personal" | "services" | "documents" | "availability";

const EDITOR_TITLES: Record<EditableSection, string> = {
  personal: "Edit personal information",
  services: "Edit services & job interests",
  documents: "Manage documents",
  availability: "Edit availability, compensation & travel",
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
 * One-time review shown once onboarding is complete and until the provider
 * confirms. It is the only page reachable in that state (`RequireOnboarding`
 * redirects everything else here) and is not reachable afterwards. Each
 * section can be edited in place; confirming sends the provider to the
 * dashboard, where later changes go through account settings.
 */
const ProviderOverview = () => {
  const navigate = useNavigate();
  const { signOut } = useProviderAuth();
  const overviewQuery = useProviderOverviewQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = overviewQuery;
  const confirmMutation = useConfirmProviderProfileMutation();
  const [editing, setEditing] = useState<EditableSection | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirm = async () => {
    setConfirmError(null);
    try {
      await confirmMutation.mutateAsync();
      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], {
        replace: true,
      });
    } catch (error) {
      setConfirmError(
        error instanceof Error
          ? error.message
          : "Could not confirm your profile. Please try again.",
      );
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Login], { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (isLoadingQuery) {
    return <ProviderAuthLoadingScreen />;
  }

  const closeEditor = () => setEditing(null);
  const editor = (section: EditableSection) => (
    <EditorCard title={EDITOR_TITLES[section]} onClose={closeEditor}>
      {section === "personal" ? <PersonalInfoEditor /> : null}
      {section === "services" ? <ServicesEditor /> : null}
      {section === "documents" ? <ProviderDocumentsStep /> : null}
      {section === "availability" ? <AvailabilityEditor /> : null}
    </EditorCard>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 12,
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
              CareSeeker Provider
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
                Review your profile
              </Typography>
              <Typography color="text.secondary">
                Here is everything you told us during registration. Check it
                over, use Edit to fix anything right here, then confirm to open
                your dashboard. After that you can still change details in
                account settings.
              </Typography>
            </Stack>
          </Paper>

          {isErrorQuery || !queryData ? (
            <ProviderErrorAlert
              message={
                overviewQuery.error?.message ?? "Could not load your profile."
              }
              onRetry={() => void overviewQuery.refetch()}
            />
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: editing === "personal" ? 12 : 7 }}>
                {editing === "personal" ? (
                  editor("personal")
                ) : (
                  <ProfileSummaryCard
                    overview={queryData}
                    onEdit={() => setEditing("personal")}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, lg: editing === "documents" ? 12 : 5 }}>
                {editing === "documents" ? (
                  editor("documents")
                ) : (
                  <DocumentsCard
                    documents={queryData.documents}
                    onEdit={() => setEditing("documents")}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                {editing === "services" ? (
                  editor("services")
                ) : (
                  <ServicesCard
                    serviceProfile={queryData.serviceProfile}
                    onEdit={() => setEditing("services")}
                  />
                )}
              </Grid>
              {editing === "availability" ? (
                <Grid size={{ xs: 12 }}>{editor("availability")}</Grid>
              ) : (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <AvailabilityCard
                      preferences={queryData.workPreferences}
                      onEdit={() => setEditing("availability")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CompensationTravelCard
                      preferences={queryData.workPreferences}
                      onEdit={() => setEditing("availability")}
                    />
                  </Grid>
                </>
              )}
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
          <Stack spacing={1}>
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
              <Button
                variant="contained"
                size="large"
                onClick={() => void handleConfirm()}
                disabled={
                  editing !== null || !queryData || confirmMutation.isPending
                }
                startIcon={
                  confirmMutation.isPending ? (
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
        </Container>
      </Paper>
    </Box>
  );
};

export default ProviderOverview;
