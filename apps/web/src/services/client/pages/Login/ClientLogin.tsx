import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";
import { useSignInClientMutation } from "../../../../queries/client";
import { ClientAuthLoadingScreen, useClientAuth } from "../../auth";
import ClientAuthLayout from "../../components/ClientAuthLayout";

const ClientLoginPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    seekerUser,
    accessDeniedMessage,
    clearAccessDeniedMessage,
    verifySeekerGateFromSession,
  } = useClientAuth();
  const signInMutation = useSignInClientMutation();
  const [formError, setFormError] = useState<string | null>(null);

  if (!initialized) {
    return <ClientAuthLoadingScreen />;
  }

  if (seekerUser) {
    return <Navigate to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    clearAccessDeniedMessage();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await signInMutation.mutateAsync({
        email,
        password,
      });

      const outcome = await verifySeekerGateFromSession();

      if (outcome === "seeker") {
        navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard], { replace: true });
        return;
      }

      if (outcome === "unauthorized") {
        setFormError(
          "Sign-in did not return a valid session. Please try again.",
        );
        return;
      }

      if (outcome === "no_session") {
        setFormError("Sign-in did not return a session. Please try again.");
        return;
      }
    } catch {
      return;
    }
  };

  return (
    <ClientAuthLayout
      title="Client Login"
      description="Sign in to manage your care requests, providers, and upcoming jobs."
      footerMode="login"
      formError={
        formError ?? signInMutation.error?.message ?? accessDeniedMessage
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          fullWidth
          disabled={signInMutation.isPending}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          fullWidth
          disabled={signInMutation.isPending}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={signInMutation.isPending}
          sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
        >
          {signInMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </Stack>
    </ClientAuthLayout>
  );
};

export default ClientLoginPage;
