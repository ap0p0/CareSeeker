import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { env } from "../../../../config/env";
import { ADMIN_ROUTE_PATHS, AdminRoute } from "../../../../routes/enums";
import { supabase } from "../../../../supabase/supabase";
import { AdminAuthLoadingScreen, useAdminAuth } from "../../auth";

/**
 * Controlled entry to the admin app (not a public portal login).
 * - Session alone is not enough: every sign-in is validated with GET /admin/me.
 * - Non-admins are signed out immediately and stay here with an error message.
 *
 * UX: loading (session check) → idle → submitting → invalid_credentials (Supabase error)
 * or not_admin / verification error (separate alerts).
 */
const AdminLoginPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    adminUser,
    accessDeniedMessage,
    clearAccessDeniedMessage,
    verifyAdminGateFromSession,
  } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!initialized) {
    return <AdminAuthLoadingScreen />;
  }

  if (adminUser) {
    return <Navigate to={ADMIN_ROUTE_PATHS[AdminRoute.Dashboard]} replace />;
  }

  const mainPlatformUrl = env.mainPlatformUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearAccessDeniedMessage();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setFormError(error.message);
        return;
      }

      const outcome = await verifyAdminGateFromSession();

      if (outcome === "admin") {
        navigate(ADMIN_ROUTE_PATHS[AdminRoute.Dashboard], { replace: true });
        return;
      }

      if (outcome === "unauthorized") {
        setFormError(
          "Your session could not be verified. Please sign in again.",
        );
        return;
      }

      if (outcome === "no_session") {
        setFormError("Sign-in did not return a session. Please try again.");
        return;
      }

      // forbidden: context sets ADMIN_ACCESS_DENIED_MESSAGE after sign-out.
      // error: context sets a separate verification message after sign-out.
    } finally {
      setSubmitting(false);
    }
  };

  const dismissBanners = () => {
    setFormError(null);
    if (accessDeniedMessage) clearAccessDeniedMessage();
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      py={4}
      sx={{ bgcolor: "background.default" }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 420,
          width: 1,
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          spacing={3}
          component="form"
          onSubmit={handleSubmit}
          aria-busy={submitting}
        >
          <Box>
            <Typography
              variant="h5"
              component="h1"
              fontWeight={600}
              gutterBottom
            >
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Internal administrator sign-in. Each attempt is validated with the
              CareSeeker servers; a standard user account cannot access this
              panel.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you are looking for the main CareSeeker platform, go back to
              the home page.
            </Typography>
          </Box>

          {accessDeniedMessage ? (
            <Alert severity="error" onClose={dismissBanners} role="alert">
              {accessDeniedMessage}
            </Alert>
          ) : null}

          {formError ? (
            <Alert
              severity="error"
              onClose={() => setFormError(null)}
              role="alert"
            >
              {formError}
            </Alert>
          ) : null}

          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            fullWidth
            disabled={submitting}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            fullWidth
            disabled={submitting}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <Button
            component="a"
            href={mainPlatformUrl}
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            fullWidth
          >
            Back to home
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            Need help? Visit{" "}
            <MuiLink href={mainPlatformUrl} underline="hover">
              CareSeeker
            </MuiLink>
            .
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminLoginPage;
