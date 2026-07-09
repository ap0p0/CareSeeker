import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import { useSignInProviderMutation } from "../../../../queries/providerAuth";
import {
  ProviderAuthLoadingScreen,
  useProviderAuth,
} from "../../auth";
import ProviderAuthLayout from "../../components/ProviderAuthLayout";
import {
  isProviderDevMockEnabled,
  setProviderMockSession,
} from "../../auth/providerDevAuth";

const ProviderLoginPage = () => {
  const navigate = useNavigate();
  const {
    initialized,
    providerUser,
    accessDeniedMessage,
    clearAccessDeniedMessage,
    verifyProviderGateFromSession,
  } = useProviderAuth();
  const signInMutation = useSignInProviderMutation();
  const [formError, setFormError] = useState<string | null>(null);

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
    clearAccessDeniedMessage();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await signInMutation.mutateAsync({
        email,
        password,
      });

      const outcome = await verifyProviderGateFromSession();

      if (outcome === "provider") {
        navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], {
          replace: true,
        });
        return;
      }

      if (outcome === "unauthorized") {
        setFormError("Sign-in did not return a valid session. Please try again.");
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

  const handleMockLogin = () => {
    setProviderMockSession();
    void verifyProviderGateFromSession().then((outcome) => {
      if (outcome === "provider") {
        navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Dashboard], { replace: true });
      }
    });
  };

  return (
    <ProviderAuthLayout
      title="Provider Login"
      description="Sign in to manage your care jobs, profile, and earnings."
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
