import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../routes/enums";
import { useProviderOnboardingQuery } from "../../../queries/provider";
import { ProviderAuthLoadingScreen } from "./ProviderAuthLoadingScreen";
import { useProviderAuth } from "./ProviderAuthContext";
import {
  clearProviderMockSession,
  hasProviderMockSession,
  isProviderDevMockEnabled,
} from "./providerDevAuth";

type RequireOnboardingProps = {
  /**
   * `app`: the provider app proper — requires a completed **and confirmed**
   * onboarding (otherwise → `/register` or `/overview`).
   * `review`: the one-time overview — requires completed but **not yet
   * confirmed** onboarding (otherwise → `/register` or the dashboard).
   */
  stage: "app" | "review";
};

/**
 * Onboarding gate for signed-in providers. Sits below `RequireProvider`.
 * A failed status check never falls through to the app: it blocks with an
 * error and a retry, because "unknown" must not be treated as "confirmed".
 */
const RequireOnboarding = ({ stage }: RequireOnboardingProps) => {
  const hasDevMockAccess = isProviderDevMockEnabled && hasProviderMockSession();
  const onboardingQuery = useProviderOnboardingQuery({
    enabled: !hasDevMockAccess,
  });
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = onboardingQuery;

  // The dev mock session has no backend account to check.
  if (hasDevMockAccess) {
    return <Outlet />;
  }

  if (isLoadingQuery) {
    return <ProviderAuthLoadingScreen />;
  }

  if (isErrorQuery || !queryData) {
    return (
      <OnboardingStatusError
        message={
          onboardingQuery.error?.message ??
          "Could not check your onboarding status."
        }
        retrying={onboardingQuery.isFetching}
        onRetry={() => void onboardingQuery.refetch()}
      />
    );
  }

  if (!queryData.completedAt) {
    return (
      <Navigate to={PROVIDER_ROUTE_PATHS[ProviderRoute.Register]} replace />
    );
  }

  const confirmed = Boolean(queryData.profileConfirmedAt);

  if (stage === "app" && !confirmed) {
    return (
      <Navigate to={PROVIDER_ROUTE_PATHS[ProviderRoute.Overview]} replace />
    );
  }

  if (stage === "review" && confirmed) {
    return (
      <Navigate to={PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard]} replace />
    );
  }

  return <Outlet />;
};

const OnboardingStatusError = ({
  message,
  retrying,
  onRetry,
}: {
  message: string;
  retrying: boolean;
  onRetry: () => void;
}) => {
  const navigate = useNavigate();
  const { signOut } = useProviderAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      clearProviderMockSession();
      await signOut();
      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Login], { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      py={4}
      role="alert"
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 520,
          width: 1,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h5" fontWeight={700}>
            We couldn’t load your account status
          </Typography>
          <Alert severity="error">{message}</Alert>
          <Typography variant="body2" color="text.secondary">
            We need to know whether your registration is complete before opening
            your account. Please try again.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={onRetry}
              disabled={retrying}
              startIcon={
                retrying ? <CircularProgress size={18} color="inherit" /> : null
              }
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
            >
              Try again
            </Button>
            <Button
              variant="text"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
            >
              Sign out
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RequireOnboarding;
