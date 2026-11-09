import type { FormEvent } from "react";
import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FieldRow, FormSection } from "../../../../../components/FormLayout";
import { Link as RouterLink } from "react-router-dom";
import PasswordTextField from "../../../../../components/PasswordTextField";
import type { RegistrantRelationship } from "../../../../../queries/client";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../../routes/enums";
import { focusFirstInvalidField } from "../../../../../utils/focusField";
import {
  REGISTRANT_RELATIONSHIP_OPTIONS,
  type RegistrantInfoErrors,
  type RegistrantInfoField,
  type RegistrantInfoForm,
} from "../types";
import { validateRegistrantInfo } from "../validation";

type RegistrantInfoStepProps = {
  value: RegistrantInfoForm;
  onChange: (next: RegistrantInfoForm) => void;
  /** Called once the step validates; the page creates the account. */
  onSubmit: () => Promise<void>;
  submitting: boolean;
  /** Server / flow error shown above the form. */
  error: string | null;
  isDuplicateEmail?: boolean;
  /** Success message (edit mode). */
  statusMessage?: string | null;
  submitLabel?: string;
  /**
   * `register` (default) creates the account, so credentials and consent are
   * collected too. `edit` is used once the account exists (going back to this
   * step): the email is shown read-only and only the details can change.
   */
  mode?: "register" | "edit";
};

const FIELD_ORDER: RegistrantInfoField[] = [
  "name",
  "surname",
  "email",
  "phone",
  "relationship",
  "relationshipOther",
  "password",
  "confirmPassword",
  "consentToActOnBehalf",
];

/**
 * Registering on behalf of someone else — step 1: the registrant, i.e. the
 * person opening the account and coordinating care. The care recipient's
 * details are collected in the following steps.
 */
const RegistrantInfoStep = ({
  value,
  onChange,
  onSubmit,
  submitting,
  error,
  isDuplicateEmail = false,
  mode = "register",
  statusMessage = null,
  submitLabel,
}: RegistrantInfoStepProps) => {
  const editing = mode === "edit";
  const [fieldErrors, setFieldErrors] = useState<RegistrantInfoErrors>({});

  const update = <K extends RegistrantInfoField>(
    field: K,
    fieldValue: RegistrantInfoForm[K],
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

  const handleRelationshipChange = (next: RegistrantRelationship | "") => {
    onChange({
      ...value,
      relationship: next,
      // Free text only belongs to "other"; drop it so it is never sent stale.
      relationshipOther: next === "other" ? value.relationshipOther : "",
    });
    setFieldErrors((current) => {
      const { relationship, relationshipOther, ...rest } = current;
      void relationship;
      void relationshipOther;
      return rest;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateRegistrantInfo(value, mode);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(FIELD_ORDER, errors);
      return;
    }

    await onSubmit();
  };

  const textFieldProps = (field: RegistrantInfoField) => ({
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

      <Typography variant="body2" color="text.secondary">
        Fields marked with{" "}
        <Typography component="span" color="error.main" fontWeight={700}>
          *
        </Typography>{" "}
        are required.
      </Typography>

      <FormSection
        title="Your details"
        description="You are the account holder and the person caregivers will contact."
      >
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
          <TextField
            {...textFieldProps("email")}
            label="Email"
            type="email"
            autoComplete="email"
            value={value.email}
            onChange={(event) => update("email", event.target.value)}
            required={!editing}
            disabled={submitting || editing}
            helperText={
              fieldErrors.email ??
              (editing
                ? "Your sign-in email cannot be changed here."
                : undefined)
            }
          />
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
        title="Your relationship"
        description="How are you related to the person who needs care?"
      >
        <FormControl
          fullWidth
          required
          disabled={submitting}
          error={Boolean(fieldErrors.relationship)}
        >
          <InputLabel id="registrant-relationship-label">
            I am their…
          </InputLabel>
          <Select
            labelId="registrant-relationship-label"
            label="I am their…"
            name="relationship"
            value={value.relationship}
            onChange={(event) =>
              handleRelationshipChange(
                event.target.value as RegistrantRelationship | "",
              )
            }
          >
            {REGISTRANT_RELATIONSHIP_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {fieldErrors.relationship ??
              "For example, choose “Child” if you are registering for your parent."}
          </FormHelperText>
        </FormControl>

        {value.relationship === "other" ? (
          <TextField
            {...textFieldProps("relationshipOther")}
            label="Please describe your relationship"
            value={value.relationshipOther}
            onChange={(event) =>
              update("relationshipOther", event.target.value)
            }
            inputProps={{ maxLength: 100 }}
            required
          />
        ) : null}
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

          <FormControl
            required
            disabled={submitting}
            error={Boolean(fieldErrors.consentToActOnBehalf)}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="consentToActOnBehalf"
                  checked={value.consentToActOnBehalf}
                  onChange={(event) =>
                    update("consentToActOnBehalf", event.target.checked)
                  }
                />
              }
              label={
                <Typography variant="body2">
                  I confirm that I am allowed to arrange care on behalf of this
                  person and to share their information with CareSeeker.{" "}
                  <Typography component="span" color="error.main">
                    *
                  </Typography>
                </Typography>
              }
              sx={{ alignItems: "flex-start", ml: 0, mr: 0 }}
            />
            {fieldErrors.consentToActOnBehalf ? (
              <FormHelperText>
                {fieldErrors.consentToActOnBehalf}
              </FormHelperText>
            ) : null}
          </FormControl>
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
        {submitting
          ? editing
            ? "Saving..."
            : "Creating account..."
          : (submitLabel ??
            (editing ? "Save & continue" : "Create account & continue"))}
      </Button>
    </Stack>
  );
};

export default RegistrantInfoStep;
