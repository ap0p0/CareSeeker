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
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../routes/enums";
import { useSeekerOnboardingQuery } from "../../../queries/client";
import { ClientAuthLoadingScreen } from "./ClientAuthLoadingScreen";
import { useClientAuth } from "./ClientAuthContext";

type RequireSeekerOnboardingProps = {
  /**
   * `app`: the client app proper — an account opened on behalf of someone
   * else must have a completed **and confirmed** registration (otherwise →
   * `/register` or the review page).
   * `review`: the one-time review — requires completed but **not yet
   * confirmed** registration (otherwise → `/register` or the dashboard).
   * Accounts registered for oneself have no such gate and always pass.
   */
  stage: "app" | "review";
};

/**
 * Registration gate for signed-in seekers. Sits below `RequireClient`. A
 * failed status check never falls through to the app: it blocks with an
 * error and a retry, because "unknown" must not be treated as "confirmed".
 */
const RequireSeekerOnboarding = ({ stage }: RequireSeekerOnboardingProps) => {
  const onboardingQuery = useSeekerOnboardingQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = onboardingQuery;
  // Whether the registration was already confirmed when the user *arrived*.
  // The review page confirms in place and then navigates where it wants (the
  // dashboard or the new-job page); reacting to that status change here would
  // race it with a redirect of our own.
  const [confirmedOnArrival, setConfirmedOnArrival] = useState<boolean | null>(
    null,
  );
  if (queryData && confirmedOnArrival === null) {
    setConfirmedOnArrival(Boolean(queryData.profileConfirmedAt));
  }

  if (isLoadingQuery) {
    return <ClientAuthLoadingScreen />;
  }

  if (isErrorQuery || !queryData) {
    return (
      <OnboardingStatusError
        message={
          onboardingQuery.error?.message ??
          "Could not check your registration status."
        }
        retrying={onboardingQuery.isFetching}
        onRetry={() => void onboardingQuery.refetch()}
      />
    );
  }

  if (queryData.careFor === "self") {
    return stage === "review" ? (
      <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]} replace />
    ) : (
      <Outlet />
    );
  }

  if (!queryData.completedAt) {
    return <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Register]} replace />;
  }

  const confirmed = Boolean(queryData.profileConfirmedAt);

  if (stage === "app" && !confirmed) {
    return (
      <Navigate
        to={SEEKER_ROUTE_PATHS[SeekerRoute.RegistrationReview]}
        replace
      />
    );
  }

  if (stage === "review" && confirmedOnArrival) {
    return <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]} replace />;
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
  const { signOut } = useClientAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Login], { replace: true });
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

export default RequireSeekerOnboarding;
