import type { FormEvent } from "react";
import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PasswordTextField from "../../../../../components/PasswordTextField";
import {
  useProviderProfileQuery,
  useUpdateProviderAccountSettingsMutation,
} from "../../../../../queries/provider";
import { PASSWORD_MIN_LENGTH } from "../../Register/validation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, md: 3 },
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Stack spacing={2}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      {children}
    </Stack>
  </Paper>
);

/** Sign-in credentials (email / password) through the auth provider. */
const AccountCredentialsTab = () => {
  const { data: queryData } = useProviderProfileQuery();
  const updateMutation = useUpdateProviderAccountSettingsMutation();

  const [email, setEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const currentEmail = email ?? queryData?.email ?? "";

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);
    setEmailStatus(null);
    const next = currentEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(next)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (next === queryData?.email) {
      setEmailError("This is already your email address.");
      return;
    }
    try {
      await updateMutation.mutateAsync({ email: next });
      setEmail(null);
      setEmailStatus(
        "Your email address was updated. Use it the next time you sign in.",
      );
    } catch (caught) {
      setEmailError(
        caught instanceof Error
          ? caught.message
          : "Could not update your email.",
      );
    }
  };

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordStatus(null);
    if (password.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      await updateMutation.mutateAsync({ password });
      setPassword("");
      setConfirmPassword("");
      setPasswordStatus("Your password was changed.");
    } catch (caught) {
      setPasswordError(
        caught instanceof Error
          ? caught.message
          : "Could not change your password.",
      );
    }
  };

  const busy = updateMutation.isPending;

  return (
    <Stack spacing={2}>
      <Section
        title="Email address"
        description="Used to sign in and for notifications."
      >
        <Stack component="form" spacing={2} onSubmit={handleEmail} noValidate>
          {emailStatus ? <Alert severity="success">{emailStatus}</Alert> : null}
          {emailError ? <Alert severity="error">{emailError}</Alert> : null}
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={currentEmail}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            disabled={busy}
            sx={{ maxWidth: { sm: 420 } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={busy}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Update email
          </Button>
        </Stack>
      </Section>

      <Section
        title="Password"
        description="Choose a new password for your account."
      >
        <Stack
          component="form"
          spacing={2}
          onSubmit={handlePassword}
          noValidate
        >
          {passwordStatus ? (
            <Alert severity="success">{passwordStatus}</Alert>
          ) : null}
          {passwordError ? (
            <Alert severity="error">{passwordError}</Alert>
          ) : null}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <PasswordTextField
              label="New password"
              name="newPassword"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              disabled={busy}
            />
            <PasswordTextField
              label="Confirm new password"
              name="confirmNewPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
              disabled={busy}
            />
          </Stack>
          <Button
            type="submit"
            variant="contained"
            disabled={busy}
            startIcon={
              busy ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              alignSelf: "flex-start",
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Change password
          </Button>
        </Stack>
      </Section>
    </Stack>
  );
};

export default AccountCredentialsTab;
