import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import { supabase } from "../../../../supabase/supabase";
import ProviderAuthLayout from "../../components/ProviderAuthLayout";
import {
  hasProviderMockSession,
  isProviderDevMockEnabled,
  setProviderMockSession,
} from "../../auth/providerDevAuth";

const ProviderLoginPage = () => {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setHasSession(Boolean(data.session) || hasProviderMockSession());
        setCheckingSession(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (checkingSession) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        role="status"
        aria-busy="true"
      >
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }

  if (hasSession) {
    return (
      <Navigate to={PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard]} replace />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockLogin = () => {
    setProviderMockSession();
    navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], { replace: true });
  };

  return (
    <ProviderAuthLayout
      title="Provider Login"
      description="Sign in to manage your care jobs, profile, and earnings."
      footerMode="login"
      formError={formError}
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          fullWidth
          disabled={submitting}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          fullWidth
          disabled={submitting}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </Button>

        {isProviderDevMockEnabled ? (
          <Button
            type="button"
            variant="outlined"
            size="large"
            onClick={handleMockLogin}
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Continue with mock login (dev)
          </Button>
        ) : null}
      </Stack>
    </ProviderAuthLayout>
  );
};

export default ProviderLoginPage;
