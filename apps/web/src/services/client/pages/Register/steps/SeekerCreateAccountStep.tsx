import type { FormEvent } from "react";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../../routes/enums";
import type { SeekerCreateAccountForm } from "../types";

type SeekerCreateAccountStepProps = {
  value: SeekerCreateAccountForm;
  onChange: (next: SeekerCreateAccountForm) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  error: string | null;
  isDuplicateEmail?: boolean;
};

const SeekerCreateAccountStep = ({
  value,
  onChange,
  onSubmit,
  submitting,
  error,
  isDuplicateEmail = false,
}: SeekerCreateAccountStepProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = <K extends keyof SeekerCreateAccountForm>(
    field: K,
    fieldValue: SeekerCreateAccountForm[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (value.password !== value.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (value.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    await onSubmit();
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {localError || error ? (
        <Alert severity="error">
          {localError ?? error}
          {!localError && isDuplicateEmail ? (
            <>
              {" "}
              Please{" "}
              <MuiLink
                component={RouterLink}
                to={SEEKER_ROUTE_PATHS[SeekerRoute.Login]}
                underline="hover"
                fontWeight={700}
              >
                log in
              </MuiLink>{" "}
              instead.
            </>
          ) : null}
        </Alert>
      ) : null}

      <TextField
        label="Name"
        name="name"
        autoComplete="given-name"
        value={value.name}
        onChange={(event) => update("name", event.target.value)}
        required
        fullWidth
        disabled={submitting}
      />
      <TextField
        label="Last name"
        name="surname"
        autoComplete="family-name"
        value={value.surname}
        onChange={(event) => update("surname", event.target.value)}
        required
        fullWidth
        disabled={submitting}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={value.email}
        onChange={(event) => update("email", event.target.value)}
        required
        fullWidth
        disabled={submitting}
      />
      <TextField
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        value={value.password}
        onChange={(event) => update("password", event.target.value)}
        required
        fullWidth
        disabled={submitting}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
                edge="end"
                disabled={submitting}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Confirm password"
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        autoComplete="new-password"
        value={value.confirmPassword}
        onChange={(event) => update("confirmPassword", event.target.value)}
        required
        fullWidth
        disabled={submitting}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((current) => !current)}
                edge="end"
                disabled={submitting}
              >
                {showConfirmPassword ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
  );
};

export default SeekerCreateAccountStep;
