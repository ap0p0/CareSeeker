import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import {
  useRegisterProviderMutation,
  useSignInProviderMutation,
} from "../../../../queries/providerAuth";
import {
  ProviderAuthLoadingScreen,
  useProviderAuth,
} from "../../auth";
import ProviderAuthLayout from "../../components/ProviderAuthLayout";

const ProviderRegisterPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    providerUser,
    accessDeniedMessage,
    clearAccessDeniedMessage,
    verifyProviderGateFromSession,
  } = useProviderAuth();
  const registerMutation = useRegisterProviderMutation();
  const signInMutation = useSignInProviderMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const submitting = registerMutation.isPending || signInMutation.isPending;

  if (!initialized) {
    return <ProviderAuthLoadingScreen />;
  }

  if (providerUser) {
    return (
      <Navigate to={PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard]} replace />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);
    clearAccessDeniedMessage();

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      try {
        await signInMutation.mutateAsync({
          email: email.trim(),
          password,
        });
      } catch {
        setStatusMessage(
          "Your account was created. Please sign in to continue."
        );
        return;
      }

      const outcome = await verifyProviderGateFromSession();

      if (outcome === "provider") {
        navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], {
          replace: true,
        });
        return;
      }

      if (outcome === "unauthorized" || outcome === "no_session") {
        setFormError(
          "Your account was created, but we could not verify the session. Please sign in."
        );
        navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Login], { replace: true });
        return;
      }

      setStatusMessage("Your account was created. Please sign in to continue.");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      }
    }
  };

  return (
    <ProviderAuthLayout
      title="Provider Register"
      description="Create your provider account to start browsing and accepting care jobs."
      footerMode="register"
      formError={
        formError ??
        registerMutation.error?.message ??
        signInMutation.error?.message ??
        accessDeniedMessage
      }
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
