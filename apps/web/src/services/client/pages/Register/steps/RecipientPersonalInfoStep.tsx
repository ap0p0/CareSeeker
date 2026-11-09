import type { FormEvent } from "react";
import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FieldRow, FormSection } from "../../../../../components/FormLayout";
import CheckboxGroupField from "../../../../../components/CheckboxGroupField";
import DateOfBirthField from "../../../../../components/DateOfBirthField";
import DescribedRadioGroup from "../../../../../components/DescribedRadioGroup";
import UsAddressFields from "../../../../../components/UsAddressFields";
import type { MobilityLevel } from "../../../../../queries/client";
import { focusFirstInvalidField } from "../../../../../utils/focusField";
import { GENDER_OPTIONS, type Gender } from "../../../../../utils/gender";
import {
  ETHNIC_BACKGROUND_OPTIONS,
  LIVING_SITUATION_OPTIONS,
  MOBILITY_LEVEL_OPTIONS,
  SPOKEN_LANGUAGE_OPTIONS,
  type CareRecipientErrors,
  type CareRecipientField,
  type CareRecipientForm,
  type EthnicBackground,
  type LivingSituation,
} from "../types";
import {
  ADDITIONAL_INFO_MAX_LENGTH,
  OTHER_LANGUAGE_MAX_LENGTH,
  RECIPIENT_AGE_RULES,
  validateCareRecipient,
} from "../validation";

type RecipientPersonalInfoStepProps = {
  value: CareRecipientForm;
  onChange: (next: CareRecipientForm) => void;
  /** Called once the step validates; the page saves it. */
  onSubmit: () => Promise<void>;
  submitting: boolean;
  /** Server / flow error shown above the form. */
  error: string | null;
  /** Success message (when editing a saved step). */
  statusMessage?: string | null;
  submitLabel?: string;
};

const FIELD_ORDER: CareRecipientField[] = [
  "name",
  "surname",
  "dateOfBirth",
  "gender",
  "addressLine1",
  "city",
  "state",
  "postalCode",
  "livingSituation",
  "mobilityLevel",
  "languagesSpoken",
  "otherLanguage",
  "ethnicBackground",
  "additionalInfo",
];

/**
 * Registering on behalf of someone else — step 2: the person who needs care
 * (identity, home address, daily life, care needed, background). Reuses the
 * option lists of the self-registration steps and the shared personal-info
 * inputs of provider onboarding.
 */
const RecipientPersonalInfoStep = ({
  value,
  onChange,
  onSubmit,
  submitting,
  error,
  statusMessage = null,
  submitLabel = "Save & continue",
}: RecipientPersonalInfoStepProps) => {
  const [fieldErrors, setFieldErrors] = useState<CareRecipientErrors>({});

  const clearErrors = (...fields: CareRecipientField[]) => {
    if (!fields.some((field) => fieldErrors[field])) return;
    setFieldErrors((current) => {
      const next = { ...current };
      for (const field of fields) delete next[field];
      return next;
    });
  };

  const update = <K extends CareRecipientField>(
    field: K,
    fieldValue: CareRecipientForm[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
    clearErrors(field);
  };

  const handleLanguagesChange = (
    next: CareRecipientForm["languagesSpoken"],
  ) => {
    onChange({
      ...value,
      languagesSpoken: next,
      otherLanguage: next.includes("other") ? value.otherLanguage : "",
    });
    clearErrors("languagesSpoken", "otherLanguage");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateCareRecipient(value);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(FIELD_ORDER, errors);
      return;
    }

    await onSubmit();
  };

  const textFieldProps = (field: CareRecipientField) => ({
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
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Typography variant="body2" color="text.secondary">
        Fields marked with{" "}
        <Typography component="span" color="error.main" fontWeight={700}>
          *
        </Typography>{" "}
        are required. Everything you share stays private and is only used to
        find the right caregiver.
      </Typography>

      <FormSection title="Personal details">
        <FieldRow>
          <TextField
            {...textFieldProps("name")}
            label="First name"
            autoComplete="off"
            value={value.name}
            onChange={(event) => update("name", event.target.value)}
            required
          />
          <TextField
            {...textFieldProps("surname")}
            label="Last name"
            autoComplete="off"
            value={value.surname}
            onChange={(event) => update("surname", event.target.value)}
            required
          />
        </FieldRow>

        <FieldRow>
          <DateOfBirthField
            value={value.dateOfBirth}
            onChange={(next) => update("dateOfBirth", next)}
            rules={RECIPIENT_AGE_RULES}
            error={fieldErrors.dateOfBirth}
            required
            disabled={submitting}
          />
          <FormControl
            fullWidth
            required
            disabled={submitting}
            error={Boolean(fieldErrors.gender)}
          >
            <InputLabel id="recipient-gender-label">Gender</InputLabel>
            <Select
              labelId="recipient-gender-label"
              label="Gender"
              name="gender"
              value={value.gender}
              onChange={(event) =>
                update("gender", event.target.value as Gender | "")
              }
            >
              {GENDER_OPTIONS.map((option) => (
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
      </FormSection>

      <Divider />

      <FormSection
        title="Home address"
        description="Where care will take place. CareSeeker is currently available in the United States only."
      >
        <UsAddressFields
          idPrefix="recipient"
          value={value}
          onChange={(field, fieldValue) => update(field, fieldValue)}
          errors={fieldErrors}
          disabled={submitting}
          autoFill={false}
        />
      </FormSection>

      <Divider />

      <FormSection title="Daily life">
        <FormControl
          fullWidth
          required
          disabled={submitting}
          error={Boolean(fieldErrors.livingSituation)}
        >
          <InputLabel id="recipient-living-situation-label">
            Living situation
          </InputLabel>
          <Select
            labelId="recipient-living-situation-label"
            label="Living situation"
            name="livingSituation"
            value={value.livingSituation}
            onChange={(event) =>
              update(
                "livingSituation",
                event.target.value as LivingSituation | "",
              )
            }
          >
            {LIVING_SITUATION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {fieldErrors.livingSituation ? (
            <FormHelperText>{fieldErrors.livingSituation}</FormHelperText>
          ) : null}
        </FormControl>

        <DescribedRadioGroup
          name="mobilityLevel"
          label="Mobility"
          options={MOBILITY_LEVEL_OPTIONS}
          value={value.mobilityLevel}
          onChange={(next: MobilityLevel) => update("mobilityLevel", next)}
          error={fieldErrors.mobilityLevel}
          required
          disabled={submitting}
        />
      </FormSection>

      <Divider />

      <FormSection
        title="Background"
        description="Helps us match them with a caregiver they can easily connect with."
      >
        <CheckboxGroupField
          name="languagesSpoken"
          label="Languages they speak"
          options={SPOKEN_LANGUAGE_OPTIONS}
          value={value.languagesSpoken}
          onChange={handleLanguagesChange}
          error={fieldErrors.languagesSpoken}
          required
          disabled={submitting}
        />
        {value.languagesSpoken.includes("other") ? (
          <TextField
            {...textFieldProps("otherLanguage")}
            label="Other language"
            value={value.otherLanguage}
            onChange={(event) => update("otherLanguage", event.target.value)}
            inputProps={{ maxLength: OTHER_LANGUAGE_MAX_LENGTH }}
            required
          />
        ) : null}

        <FormControl
          fullWidth
          required
          disabled={submitting}
          error={Boolean(fieldErrors.ethnicBackground)}
        >
          <InputLabel id="recipient-ethnic-background-label">
            Ethnic background
          </InputLabel>
          <Select
            labelId="recipient-ethnic-background-label"
            label="Ethnic background"
            name="ethnicBackground"
            value={value.ethnicBackground}
            onChange={(event) =>
              update(
                "ethnicBackground",
                event.target.value as EthnicBackground | "",
              )
            }
          >
            {ETHNIC_BACKGROUND_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {fieldErrors.ethnicBackground ? (
            <FormHelperText>{fieldErrors.ethnicBackground}</FormHelperText>
          ) : null}
        </FormControl>
      </FormSection>

      <Divider />

      <FormSection
        title="About them"
        description="Care instructions (diet, equipment, routines) come in the next step."
      >
        <TextField
          {...textFieldProps("additionalInfo")}
          label="What should a caregiver know about them? (optional)"
          placeholder="Personality, interests, what they enjoy talking about, what makes a good day…"
          value={value.additionalInfo}
          onChange={(event) => update("additionalInfo", event.target.value)}
          multiline
          minRows={3}
          inputProps={{ maxLength: ADDITIONAL_INFO_MAX_LENGTH }}
          helperText={
            fieldErrors.additionalInfo ??
            `${value.additionalInfo.length} / ${ADDITIONAL_INFO_MAX_LENGTH}`
          }
        />
      </FormSection>

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
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </Stack>
  );
};

export default RecipientPersonalInfoStep;
