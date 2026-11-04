import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link as RouterLink } from "react-router-dom";
import PasswordTextField from "../../../../../components/PasswordTextField";
import type { ProviderGender } from "../../../../../queries/provider";
import {
  PROVIDER_ROUTE_PATHS,
  ProviderRoute,
} from "../../../../../routes/enums";
import ProfilePictureField from "../components/ProfilePictureField";
import { focusFirstInvalidField } from "../focusField";
import {
  PROVIDER_GENDER_OPTIONS,
  type ProviderPersonalInfoErrors,
  type ProviderPersonalInfoField,
  type ProviderPersonalInfoForm,
} from "../types";
import { US_STATE_OPTIONS } from "../usStates";
import {
  MIN_PROVIDER_AGE,
  getDateOfBirthBounds,
  validateProviderPersonalInfo,
} from "../validation";

type ProviderPersonalInfoStepProps = {
  value: ProviderPersonalInfoForm;
  onChange: (next: ProviderPersonalInfoForm) => void;
  /** Called once the step validates; the page decides what happens next. */
  onSubmit: () => void | Promise<void>;
  submitting: boolean;
  submitLabel?: string;
  /** Server / flow error shown above the form. */
  error: string | null;
  isDuplicateEmail?: boolean;
  /**
   * `register` (default) collects account credentials too; `edit` (account
   * settings) only personal details, with the stored picture as default.
   */
  mode?: "register" | "edit";
  currentPictureUrl?: string | null;
  /** Success message (edit mode). */
  statusMessage?: string | null;
};

const FIELD_ORDER: ProviderPersonalInfoField[] = [
  "name",
  "surname",
  "dateOfBirth",
  "gender",
  "profilePicture",
  "email",
  "phone",
  "addressLine1",
  "city",
  "state",
  "postalCode",
  "password",
  "confirmPassword",
];

const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <Stack spacing={2}>
    <Stack spacing={0.25}>
      <Typography variant="subtitle1" component="h2" fontWeight={700}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
    </Stack>
    {children}
  </Stack>
);

/** Two fields side by side on tablet+, stacked on phones. */
const FieldRow = ({ children }: { children: ReactNode }) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
    {children}
  </Stack>
);

const ProviderPersonalInfoStep = ({
  value,
  onChange,
  onSubmit,
  submitting,
  submitLabel = "Continue",
  error,
  isDuplicateEmail = false,
  mode = "register",
  currentPictureUrl = null,
  statusMessage = null,
}: ProviderPersonalInfoStepProps) => {
  const editing = mode === "edit";
  const [fieldErrors, setFieldErrors] = useState<ProviderPersonalInfoErrors>(
    {},
  );
  const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);
  const dateOfBirthBounds = useMemo(() => getDateOfBirthBounds(), []);

  const update = <K extends ProviderPersonalInfoField>(
    field: K,
    fieldValue: ProviderPersonalInfoForm[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });

    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateProviderPersonalInfo(value, undefined, mode);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(FIELD_ORDER, errors);
      return;
    }

    await onSubmit();
  };

  const textFieldProps = (field: ProviderPersonalInfoField) => ({
    name: field,
    error: Boolean(fieldErrors[field]),
    helperText: fieldErrors[field],
    fullWidth: true,
    disabled: submitting,
  });

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
    >
      {statusMessage ? <Alert severity="success">{statusMessage}</Alert> : null}
      {error ? (
        <Alert severity="error">
          {error}
          {isDuplicateEmail ? (
            <>
              {" "}
              Please{" "}
              <MuiLink
                component={RouterLink}
                to={PROVIDER_ROUTE_PATHS[ProviderRoute.Login]}
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

      <Typography variant="body2" color="text.secondary">
        Fields marked with{" "}
        <Typography component="span" color="error.main" fontWeight={700}>
          *
        </Typography>{" "}
        are required.
      </Typography>

      <FormSection title="Personal details">
        <FieldRow>
          <TextField
            {...textFieldProps("name")}
            label="First name"
            autoComplete="given-name"
            value={value.name}
            onChange={(event) => update("name", event.target.value)}
            required
          />
          <TextField
            {...textFieldProps("surname")}
            label="Last name"
            autoComplete="family-name"
            value={value.surname}
            onChange={(event) => update("surname", event.target.value)}
            required
          />
        </FieldRow>

        <FieldRow>
          <DatePicker
            label="Date of birth"
            value={value.dateOfBirth}
            onChange={(next) => update("dateOfBirth", next)}
            open={dateOfBirthOpen}
            onOpen={() => setDateOfBirthOpen(true)}
            onClose={() => setDateOfBirthOpen(false)}
            openTo="year"
            views={["year", "month", "day"]}
            minDate={dateOfBirthBounds.min}
            maxDate={dateOfBirthBounds.max}
            disabled={submitting}
            slotProps={{
              textField: {
                ...textFieldProps("dateOfBirth"),
                required: true,
                autoComplete: "bday",
                // Open the calendar from the whole field, not only the icon.
                onClick: () => {
                  if (!submitting) setDateOfBirthOpen(true);
                },
                helperText:
                  fieldErrors.dateOfBirth ??
                  `You must be at least ${MIN_PROVIDER_AGE} years old.`,
              },
            }}
          />
          <FormControl
            fullWidth
            disabled={submitting}
            error={Boolean(fieldErrors.gender)}
          >
            <InputLabel id="provider-gender-label">
              Gender (optional)
            </InputLabel>
            <Select
              labelId="provider-gender-label"
              label="Gender (optional)"
              name="gender"
              value={value.gender}
              onChange={(event) =>
                update("gender", event.target.value as ProviderGender | "")
              }
            >
              <MenuItem value="">
                <em>Not specified</em>
              </MenuItem>
              {PROVIDER_GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.gender ? (
              <FormHelperText>{fieldErrors.gender}</FormHelperText>
            ) : null}
          </FormControl>
        </FieldRow>

        <ProfilePictureField
          value={value.profilePicture}
          onChange={(file) => update("profilePicture", file)}
          error={fieldErrors.profilePicture}
          disabled={submitting}
          required={!editing}
          currentImageUrl={currentPictureUrl}
        />
      </FormSection>

      <Divider />

      <FormSection
        title="Contact details"
        description={
          editing
            ? "Your email address can be changed under the Account tab."
            : "Used to sign in and to reach you about care requests."
        }
      >
        <FieldRow>
          {!editing ? (
            <TextField
              {...textFieldProps("email")}
              label="Email"
              type="email"
              autoComplete="email"
              value={value.email}
              onChange={(event) => update("email", event.target.value)}
              required
            />
          ) : null}
          <TextField
            {...textFieldProps("phone")}
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={value.phone}
            onChange={(event) => update("phone", event.target.value)}
            required
          />
        </FieldRow>
      </FormSection>

      <Divider />

      <FormSection
        title="Home address"
        description="CareSeeker is currently available in the United States only."
      >
        <TextField
          {...textFieldProps("addressLine1")}
          label="Street address"
          autoComplete="address-line1"
          value={value.addressLine1}
          onChange={(event) => update("addressLine1", event.target.value)}
          required
        />
        <TextField
          {...textFieldProps("city")}
          label="City"
          autoComplete="address-level2"
          value={value.city}
          onChange={(event) => update("city", event.target.value)}
          required
        />
        <FieldRow>
          <FormControl
            fullWidth
            required
            disabled={submitting}
            error={Boolean(fieldErrors.state)}
          >
            <InputLabel id="provider-state-label">State</InputLabel>
            <Select
              labelId="provider-state-label"
              label="State"
              name="state"
              autoComplete="address-level1"
              value={value.state}
              onChange={(event) => update("state", event.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
            >
              {US_STATE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.state ? (
              <FormHelperText>{fieldErrors.state}</FormHelperText>
            ) : null}
          </FormControl>
          <TextField
            {...textFieldProps("postalCode")}
            label="ZIP code"
            autoComplete="postal-code"
            inputProps={{ inputMode: "numeric", maxLength: 10 }}
            value={value.postalCode}
            onChange={(event) => update("postalCode", event.target.value)}
            required
          />
        </FieldRow>
      </FormSection>

      {!editing ? (
        <>
          <Divider />

          <FormSection title="Account security">
            <FieldRow>
              <PasswordTextField
                {...textFieldProps("password")}
                label="Password"
                autoComplete="new-password"
                value={value.password}
                onChange={(event) => update("password", event.target.value)}
                required
              />
              <PasswordTextField
                {...textFieldProps("confirmPassword")}
                label="Confirm password"
                autoComplete="new-password"
                value={value.confirmPassword}
                onChange={(event) =>
                  update("confirmPassword", event.target.value)
                }
                required
              />
            </FieldRow>
          </FormSection>
        </>
      ) : null}

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        startIcon={
          submitting ? <CircularProgress size={18} color="inherit" /> : null
        }
        sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
      >
        {submitting ? "Please wait..." : submitLabel}
      </Button>
    </Stack>
  );
};

export default ProviderPersonalInfoStep;
