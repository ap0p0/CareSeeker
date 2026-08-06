import { useState } from "react";
import {
  Alert,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { ProviderPageShell } from "../../components";

const ProviderAccountSettings = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("provider@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSaveAccount = () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }
    setStatusMessage("Account information saved.");
  };

  const handleChangePassword = () => {
    setErrorMessage(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
    setStatusMessage("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <ProviderPageShell
      title="Account settings"
      description="Update your account information, password, and notification preferences."
    >
      <Stack spacing={2}>
        {statusMessage ? (
          <Alert severity="success">{statusMessage}</Alert>
        ) : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

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
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleSaveAccount}>
              Save account information
            </Button>
          </Stack>
        </Paper>

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
            <TextField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              fullWidth
            />
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleChangePassword}>
              Change password
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(event) =>
                    setEmailNotifications(event.target.checked)
                  }
                />
              }
              label="Email notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={pushNotifications}
                  onChange={(event) =>
                    setPushNotifications(event.target.checked)
                  }
                />
              }
              label="Push notifications"
            />
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="outlined" color="warning">
            Deactivate account
          </Button>
          <Button variant="outlined" color="error">
            Delete account
          </Button>
        </Stack>
      </Stack>
    </ProviderPageShell>
  );
};

export default ProviderAccountSettings;
