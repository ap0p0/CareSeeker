import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";
import {
  useRegisterSeekerMutation,
  useSignInClientMutation,
} from "../../../../queries/clientAuth";
import {
  ClientAuthLoadingScreen,
  useClientAuth,
} from "../../auth";
import ClientAuthLayout from "../../components/ClientAuthLayout";

const ClientRegisterPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    seekerUser,
    accessDeniedMessage,
    clearAccessDeniedMessage,
    verifySeekerGateFromSession,
  } = useClientAuth();
  const registerMutation = useRegisterSeekerMutation();
  const signInMutation = useSignInClientMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const submitting = registerMutation.isPending || signInMutation.isPending;

  if (!initialized) {
    return <ClientAuthLoadingScreen />;
  }

  if (seekerUser) {
    return <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]} replace />;
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

      const outcome = await verifySeekerGateFromSession();

      if (outcome === "seeker") {
        navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard], { replace: true });
        return;
      }

      if (outcome === "unauthorized" || outcome === "no_session") {
        setFormError(
          "Your account was created, but we could not verify the session. Please sign in."
        );
        navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Login], { replace: true });
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
    <ClientAuthLayout
      title="Client Register"
      description="Create your client account to start posting care needs and managing your matches."
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
    </ClientAuthLayout>
  );
};

export default ClientRegisterPage;
