import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import { supabase } from "../../../../supabase/supabase";
import ProviderAuthLayout from "../../components/ProviderAuthLayout";

const ProviderRegisterPage = () => {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setHasSession(Boolean(data.session));
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
    setStatusMessage(null);

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setFormError(signUpError.message);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setStatusMessage(
          "Your account was created. Please sign in to continue."
        );
        navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Login], { replace: true });
        return;
      }

      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProviderAuthLayout
      title="Provider Register"
      description="Create your provider account to start browsing and accepting care jobs."
      footerMode="register"
      formError={formError}
      statusMessage={statusMessage}
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
          disabled={submitting}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          disabled={submitting}
        />
        <TextField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </Stack>
    </ProviderAuthLayout>
  );
};

export default ProviderRegisterPage;
