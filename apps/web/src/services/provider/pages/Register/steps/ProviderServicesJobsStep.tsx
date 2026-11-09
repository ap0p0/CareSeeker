import type { FormEvent } from "react";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormSection } from "../../../../../components/FormLayout";
import CheckboxGroupField from "../../../../../components/CheckboxGroupField";
import { focusFirstInvalidField } from "../../../../../utils/focusField";
import {
  CARE_SERVICE_OPTIONS,
  CARE_SKILL_OPTIONS,
  CARE_TASK_OPTIONS,
  CLIENT_GROUP_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  LANGUAGE_OPTIONS,
  QUALIFICATION_OPTIONS,
  type SpokenLanguage,
} from "../../../../../utils/careOptions";
import type {
  ProviderServicesJobsErrors,
  ProviderServicesJobsField,
  ProviderServicesJobsForm,
} from "../types";
import {
  COVER_LETTER_MAX_LENGTH,
  COVER_LETTER_MIN_LENGTH,
  OTHER_TEXT_MAX_LENGTH,
  PREVIOUS_EXPERIENCE_MAX_LENGTH,
  YEARS_OF_EXPERIENCE_MAX,
  validateProviderServicesJobs,
} from "../validation";

type ProviderServicesJobsStepProps = {
  value: ProviderServicesJobsForm;
  onChange: (next: ProviderServicesJobsForm) => void;
  onSubmit: () => Promise<void>;
  /** Hidden when the account already exists (resuming onboarding). */
  onBack?: () => void;
  submitting: boolean;
  submitLabel: string;
  /** Server / flow error shown above the form. */
  error: string | null;
};

const FIELD_ORDER: ProviderServicesJobsField[] = [
  "careServices",
  "otherCareService",
  "skills",
  "otherSkill",
  "yearsOfExperience",
  "previousCareExperience",
  "qualifications",
  "otherQualification",
  "languages",
  "otherLanguage",
  "coverLetter",
  "jobCategories",
  "tasksWilling",
  "tasksUnwilling",
  "clientGroups",
];

const languageLabel = (value: SpokenLanguage) =>
  LANGUAGE_OPTIONS.find((option) => option.value === value)?.label ?? value;

const ProviderServicesJobsStep = ({
  value,
  onChange,
  onSubmit,
  onBack,
  submitting,
  submitLabel,
  error,
}: ProviderServicesJobsStepProps) => {
  const [fieldErrors, setFieldErrors] = useState<ProviderServicesJobsErrors>(
    {},
  );

  const clearError = (...fields: ProviderServicesJobsField[]) => {
    if (!fields.some((field) => fieldErrors[field])) return;
    setFieldErrors((current) => {
      const next = { ...current };
      for (const field of fields) delete next[field];
      return next;
    });
  };

  const update = <K extends ProviderServicesJobsField>(
    field: K,
    fieldValue: ProviderServicesJobsForm[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
    clearError(field);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateProviderServicesJobs(value);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(FIELD_ORDER, errors);
      return;
    }

    await onSubmit();
  };

  const textFieldProps = (field: ProviderServicesJobsField) => ({
    name: field,
    error: Boolean(fieldErrors[field]),
    helperText: fieldErrors[field],
    fullWidth: true,
    disabled: submitting,
  });

  const coverLetterLength = value.coverLetter.trim().length;

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Typography variant="body2" color="text.secondary">
        Fields marked with{" "}
        <Typography component="span" color="error.main" fontWeight={700}>
          *
        </Typography>{" "}
        are required. These answers power search filters and matching, so choose
        everything that applies.
      </Typography>

      <FormSection spacing={2.5} title="Care services">
        <CheckboxGroupField
          name="careServices"
          label="Services you offer"
          options={CARE_SERVICE_OPTIONS}
          value={value.careServices}
          onChange={(next) => {
            onChange({
              ...value,
              careServices: next,
              otherCareService: next.includes("other")
                ? value.otherCareService
                : "",
            });
            clearError("careServices", "otherCareService");
          }}
          error={fieldErrors.careServices}
          required
          disabled={submitting}
        />
        {value.careServices.includes("other") ? (
          <TextField
            {...textFieldProps("otherCareService")}
            label="Other care service"
            placeholder="e.g. Respite care"
            value={value.otherCareService}
            onChange={(event) => update("otherCareService", event.target.value)}
            inputProps={{ maxLength: OTHER_TEXT_MAX_LENGTH }}
            required
          />
        ) : null}
      </FormSection>

      <Divider />

      <FormSection spacing={2.5} title="Skills & experience">
        <CheckboxGroupField
          name="skills"
          label="Relevant skills"
          options={CARE_SKILL_OPTIONS}
          value={value.skills}
          onChange={(next) => {
            onChange({
              ...value,
              skills: next,
              otherSkill: next.includes("other") ? value.otherSkill : "",
            });
            clearError("skills", "otherSkill");
          }}
          error={fieldErrors.skills}
          required
          disabled={submitting}
        />
        {value.skills.includes("other") ? (
          <TextField
            {...textFieldProps("otherSkill")}
            label="Other skill"
            value={value.otherSkill}
            onChange={(event) => update("otherSkill", event.target.value)}
            inputProps={{ maxLength: OTHER_TEXT_MAX_LENGTH }}
            required
          />
        ) : null}

        <TextField
          {...textFieldProps("yearsOfExperience")}
          label="Years of professional experience"
          type="number"
          inputProps={{ min: 0, max: YEARS_OF_EXPERIENCE_MAX, step: 1 }}
          value={value.yearsOfExperience}
          onChange={(event) => update("yearsOfExperience", event.target.value)}
          required
          sx={{ maxWidth: { sm: 280 } }}
          helperText={
            fieldErrors.yearsOfExperience ?? "Enter 0 if you are just starting."
          }
        />

        <TextField
          {...textFieldProps("previousCareExperience")}
          label="Previous care experience"
          placeholder="Where have you provided care before, and for whom? Informal experience (family, volunteering) counts too."
          value={value.previousCareExperience}
          onChange={(event) =>
            update("previousCareExperience", event.target.value)
          }
          multiline
          minRows={3}
          inputProps={{ maxLength: PREVIOUS_EXPERIENCE_MAX_LENGTH }}
          required
        />

        <CheckboxGroupField
          name="qualifications"
          label="Professional qualifications (optional)"
          options={QUALIFICATION_OPTIONS}
          value={value.qualifications}
          onChange={(next) => {
            onChange({
              ...value,
              qualifications: next,
              otherQualification: next.includes("other")
                ? value.otherQualification
                : "",
            });
            clearError("qualifications", "otherQualification");
          }}
          error={fieldErrors.qualifications}
          helperText="You will be able to upload certificates in the next step."
          disabled={submitting}
        />
        {value.qualifications.includes("other") ? (
          <TextField
            {...textFieldProps("otherQualification")}
            label="Other qualification"
            value={value.otherQualification}
            onChange={(event) =>
              update("otherQualification", event.target.value)
            }
            inputProps={{ maxLength: OTHER_TEXT_MAX_LENGTH }}
            required
          />
        ) : null}

        <FormControl
          fullWidth
          required
          disabled={submitting}
          error={Boolean(fieldErrors.languages)}
        >
          <InputLabel id="provider-languages-label">
            Languages spoken
          </InputLabel>
          <Select
            labelId="provider-languages-label"
            label="Languages spoken"
            name="languages"
            multiple
            value={value.languages}
            onChange={(event) => {
              const next = (
                typeof event.target.value === "string"
                  ? event.target.value.split(",")
                  : event.target.value
              ) as SpokenLanguage[];
              onChange({
                ...value,
                languages: next,
                otherLanguage: next.includes("other")
                  ? value.otherLanguage
                  : "",
              });
              clearError("languages", "otherLanguage");
            }}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((language) => (
                  <Chip
                    key={language}
                    label={languageLabel(language)}
                    size="small"
                  />
                ))}
              </Box>
            )}
            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value} dense>
                <Checkbox
                  size="small"
                  checked={value.languages.includes(option.value)}
                />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {fieldErrors.languages ?? "Select every language you can care in."}
          </FormHelperText>
        </FormControl>
        {value.languages.includes("other") ? (
          <TextField
            {...textFieldProps("otherLanguage")}
            label="Other language"
            value={value.otherLanguage}
            onChange={(event) => update("otherLanguage", event.target.value)}
            inputProps={{ maxLength: OTHER_TEXT_MAX_LENGTH }}
            required
          />
        ) : null}

        <TextField
          {...textFieldProps("coverLetter")}
          label="About you"
          placeholder="Say something about yourself in a few sentences — what you enjoy about care work and what clients can expect from you."
          value={value.coverLetter}
          onChange={(event) => update("coverLetter", event.target.value)}
          multiline
          minRows={4}
          inputProps={{ maxLength: COVER_LETTER_MAX_LENGTH }}
          required
          helperText={
            fieldErrors.coverLetter ??
            `${coverLetterLength}/${COVER_LETTER_MAX_LENGTH} characters (at least ${COVER_LETTER_MIN_LENGTH}).`
          }
        />
      </FormSection>

      <Divider />

      <FormSection
        spacing={2.5}
        title="Job interests"
        description="Tell us what kind of work you are looking for so we only suggest matching requests."
      >
        <CheckboxGroupField
          name="jobCategories"
          label="Preferred care categories"
          options={JOB_CATEGORY_OPTIONS}
          value={value.jobCategories}
          onChange={(next) => update("jobCategories", next)}
          error={fieldErrors.jobCategories}
          required
          disabled={submitting}
        />

        <CheckboxGroupField
          name="tasksWilling"
          label="Tasks you are willing to perform"
          options={CARE_TASK_OPTIONS}
          value={value.tasksWilling}
          onChange={(next) => {
            onChange({ ...value, tasksWilling: next });
            clearError("tasksWilling", "tasksUnwilling");
          }}
          error={fieldErrors.tasksWilling}
          required
          disabled={submitting}
          disabledValues={value.tasksUnwilling}
        />

        <CheckboxGroupField
          name="tasksUnwilling"
          label="Tasks you are not willing to perform (optional)"
          options={CARE_TASK_OPTIONS}
          value={value.tasksUnwilling}
          onChange={(next) => update("tasksUnwilling", next)}
          error={fieldErrors.tasksUnwilling}
          helperText="Tasks already marked as willing are greyed out."
          disabled={submitting}
          disabledValues={value.tasksWilling}
        />

        <CheckboxGroupField
          name="clientGroups"
          label="Preferred patient / client groups"
          options={CLIENT_GROUP_OPTIONS}
          value={value.clientGroups}
          onChange={(next) => update("clientGroups", next)}
          error={fieldErrors.clientGroups}
          required
          disabled={submitting}
        />
      </FormSection>

      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        spacing={1.5}
        justifyContent="space-between"
      >
        {onBack ? (
          <Button
            type="button"
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            disabled={submitting}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={18} color="inherit" /> : null
          }
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            minWidth: { sm: 220 },
          }}
        >
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProviderServicesJobsStep;
