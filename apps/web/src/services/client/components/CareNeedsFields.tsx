import { useMemo } from "react";
import dayjs from "dayjs";
import {
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import CheckboxGroupField from "../../../components/CheckboxGroupField";
import DescribedRadioGroup from "../../../components/DescribedRadioGroup";
import {
  FieldRow,
  FormSection,
  SwitchRow,
} from "../../../components/FormLayout";
import WeeklyScheduleField from "../../../components/WeeklyScheduleField";
import type {
  CareDuration,
  CareFrequency,
  PaymentType,
} from "../../../queries/client";
import {
  CARE_TASK_OPTIONS,
  type SpokenLanguage as CareLanguage,
} from "../../../utils/careOptions";
import {
  CARE_DAY_MODE_OPTIONS,
  CARE_DURATION_OPTIONS,
  CARE_FREQUENCY_OPTIONS,
  DRIVING_TASK,
  MIN_EXPERIENCE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  PET_CARE_TASK,
  PREFERRED_LANGUAGE_OPTIONS,
  REQUIRED_QUALIFICATION_OPTIONS,
  budgetUnit,
  isOneTimeCare,
  isRecurringCare,
  type CarePreferencesErrors,
  type CarePreferencesForm,
} from "../pages/Register/carePreferencesForm";
import {
  CARE_URGENCY_OPTIONS,
  HOME_ACCESSIBILITY_OPTIONS,
  PREFERRED_CAREGIVER_GENDER_OPTIONS,
  type CareUrgency,
  type PreferredCaregiverGender,
} from "../pages/Register/types";
import {
  CULTURAL_CONSIDERATIONS_MAX_LENGTH,
  MAX_HOURS_PER_WEEK,
  MAX_VISIT_DAYS_AHEAD,
  SPECIAL_REQUIREMENTS_MAX_LENGTH,
  VISIT_NOTES_MAX_LENGTH,
} from "../pages/Register/validation";

/** Field names in page order, for focusing the first invalid one. */
export const CARE_NEEDS_FIELD_ORDER = [
  "careFrequency",
  "careTasks",
  "visitDate",
  "visitStart",
  "visitEnd",
  "visitNotes",
  "hoursPerWeek",
  "careDuration",
  "careUrgency",
  "days",
  ...[1, 2, 3, 4, 5, 6, 0].map((day) => `day-${day}`),
  "budget",
  "specialRequirements",
  "preferredCaregiverGender",
  "culturalConsiderations",
];

type CareNeedsFieldsProps = {
  value: CarePreferencesForm;
  onChange: (next: CarePreferencesForm) => void;
  /** Messages from `validateCarePreferences`, shown under the fields. */
  errors: CarePreferencesErrors;
  /** Editing a field clears its message; switching care type clears all. */
  onErrorsChange: (next: CarePreferencesErrors) => void;
  disabled: boolean;
  /** First name of the person receiving care, to personalize the copy. */
  recipientName?: string;
};

/**
 * The care needs & assistance preference questions (no `<form>`, no submit
 * button), shared by registration step 3 / its editor and the job post
 * page. The first question (one-time visit or ongoing care) decides what
 * follows: a one-time visit only asks what it is about, when, and the
 * budget; recurring care asks for hours, duration, start and a weekly
 * schedule. Special requirements and caregiver preferences apply to both.
 * Questions that other answers already settle are not asked (the driving
 * task implies a car, pet care implies pets, overnight hours imply
 * overnight care).
 */
const CareNeedsFields = ({
  value,
  onChange,
  errors,
  onErrorsChange,
  disabled,
  recipientName,
}: CareNeedsFieldsProps) => {
  const name = recipientName?.trim() || null;
  const oneTime = isOneTimeCare(value);
  const recurring = isRecurringCare(value);
  const needsDriving = value.careTasks.includes(DRIVING_TASK);
  const needsPetCare = value.careTasks.includes(PET_CARE_TASK);
  const visitDateBounds = useMemo(
    () => ({
      min: dayjs().startOf("day"),
      max: dayjs().startOf("day").add(MAX_VISIT_DAYS_AHEAD, "day"),
    }),
    [],
  );

  const clearErrors = (...keys: string[]) => {
    if (!keys.some((key) => errors[key])) return;
    const next = { ...errors };
    for (const key of keys) delete next[key];
    onErrorsChange(next);
  };

  const update = <K extends keyof CarePreferencesForm>(
    field: K,
    fieldValue: CarePreferencesForm[K],
    ...alsoClear: string[]
  ) => {
    onChange({ ...value, [field]: fieldValue });
    clearErrors(field, ...alsoClear);
  };

  const handleFrequencyChange = (next: CareFrequency) => {
    onChange({
      ...value,
      careFrequency: next,
      // A one-time visit is usually paid as a fixed price; follow the choice
      // until the user has typed an amount.
      paymentType: value.budget.trim()
        ? value.paymentType
        : next === "one_time"
          ? "fixed_price"
          : "hourly",
    });
    // Errors of the other shape no longer apply.
    onErrorsChange({});
  };

  const textFieldProps = (field: keyof CarePreferencesForm) => ({
    name: field,
    error: Boolean(errors[field]),
    helperText: errors[field],
    fullWidth: true,
    disabled,
  });

  const timePickerProps = (field: "visitStart" | "visitEnd") => ({
    minutesStep: 5,
    disabled,
    slotProps: {
      textField: {
        name: field,
        fullWidth: true,
        required: true,
        error: Boolean(errors[field]),
        helperText: errors[field],
      },
    },
  });

  return (
    <>
      <FormSection title="Type of care">
        <DescribedRadioGroup
          name="careFrequency"
          label="Is this a one-time visit or ongoing care?"
          options={CARE_FREQUENCY_OPTIONS}
          value={value.careFrequency}
          onChange={handleFrequencyChange}
          error={errors.careFrequency}
          required
          disabled={disabled}
        />
      </FormSection>

      <Divider />

      <FormSection
        title="Help needed"
        description={
          name
            ? `Select everything ${name} needs help with.`
            : "Select everything they need help with."
        }
      >
        <CheckboxGroupField
          name="careTasks"
          label={
            oneTime
              ? "What is the visit about?"
              : "What should the caregiver help with?"
          }
          options={CARE_TASK_OPTIONS}
          value={value.careTasks}
          onChange={(next) => update("careTasks", next)}
          error={errors.careTasks}
          required
          disabled={disabled}
        />
        {needsDriving ? (
          <SwitchRow
            name="requiresWheelchairAccessibleVehicle"
            label="The car must be wheelchair accessible"
            hint="The caregiver drives their own car."
            checked={value.requiresWheelchairAccessibleVehicle}
            onChange={(next) =>
              update("requiresWheelchairAccessibleVehicle", next)
            }
            disabled={disabled}
          />
        ) : null}
        {oneTime ? (
          <TextField
            {...textFieldProps("visitNotes")}
            label="Anything specific about the visit? (optional)"
            placeholder="e.g. Drive her to the cardiologist at 10:30, wait with her and bring her home."
            value={value.visitNotes}
            onChange={(event) => update("visitNotes", event.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: VISIT_NOTES_MAX_LENGTH }}
          />
        ) : null}
      </FormSection>

      {oneTime ? (
        <>
          <Divider />
          <FormSection title="When is the visit?">
            <DatePicker
              label="Date"
              value={value.visitDate}
              onChange={(next) => update("visitDate", next)}
              minDate={visitDateBounds.min}
              maxDate={visitDateBounds.max}
              disabled={disabled}
              slotProps={{
                textField: {
                  name: "visitDate",
                  fullWidth: true,
                  required: true,
                  error: Boolean(errors.visitDate),
                  helperText: errors.visitDate,
                },
              }}
            />
            <FieldRow>
              <TimePicker
                label="From"
                value={value.visitStart}
                onChange={(next) => update("visitStart", next, "visitEnd")}
                {...timePickerProps("visitStart")}
              />
              <TimePicker
                label="To"
                value={value.visitEnd}
                onChange={(next) => update("visitEnd", next)}
                {...timePickerProps("visitEnd")}
              />
            </FieldRow>
            <SwitchRow
              name="scheduleFlexible"
              label="The date and time are flexible"
              hint="Caregivers can suggest a time close to this."
              checked={value.scheduleFlexible}
              onChange={(next) => update("scheduleFlexible", next)}
              disabled={disabled}
            />
          </FormSection>
        </>
      ) : null}

      {recurring ? (
        <>
          <Divider />
          <FormSection title="How much & how long">
            <TextField
              {...textFieldProps("hoursPerWeek")}
              label="About how many hours per week?"
              type="number"
              inputProps={{
                min: 1,
                max: MAX_HOURS_PER_WEEK,
                inputMode: "numeric",
              }}
              value={value.hoursPerWeek}
              onChange={(event) => update("hoursPerWeek", event.target.value)}
              helperText={
                errors.hoursPerWeek ??
                "An estimate is fine — it helps caregivers see if they have the time."
              }
              required
            />
            <FormControl
              fullWidth
              required
              disabled={disabled}
              error={Boolean(errors.careDuration)}
            >
              <InputLabel id="care-duration-label">
                How long will care be needed?
              </InputLabel>
              <Select
                labelId="care-duration-label"
                label="How long will care be needed?"
                name="careDuration"
                value={value.careDuration}
                onChange={(event) =>
                  update("careDuration", event.target.value as CareDuration)
                }
              >
                {CARE_DURATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.careDuration ? (
                <FormHelperText>{errors.careDuration}</FormHelperText>
              ) : null}
            </FormControl>
            <FormControl
              fullWidth
              required
              disabled={disabled}
              error={Boolean(errors.careUrgency)}
            >
              <InputLabel id="care-urgency-label">
                When should care start?
              </InputLabel>
              <Select
                labelId="care-urgency-label"
                label="When should care start?"
                name="careUrgency"
                value={value.careUrgency}
                onChange={(event) =>
                  update("careUrgency", event.target.value as CareUrgency)
                }
              >
                {CARE_URGENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.careUrgency ? (
                <FormHelperText>{errors.careUrgency}</FormHelperText>
              ) : null}
            </FormControl>
          </FormSection>

          <Divider />

          <FormSection
            title="Preferred schedule"
            description="Turn on the days care is needed, then choose all day or add the hours. Hours that end the next day count as overnight care."
          >
            <WeeklyScheduleField
              value={value.schedule}
              onChange={(schedule) => {
                onChange({ ...value, schedule });
                clearErrors(
                  "days",
                  ...Object.keys(schedule).map((day) => `day-${day}`),
                );
              }}
              errors={errors}
              modeOptions={CARE_DAY_MODE_OPTIONS}
              label="Days care is needed"
              offLabel="No care needed"
              dayToggleLabel={(day) => `Care needed on ${day}`}
              disabled={disabled}
            />
            <Stack spacing={1.5}>
              <SwitchRow
                name="scheduleFlexible"
                label="The days and times are flexible"
                hint="Caregivers can suggest other times close to these."
                checked={value.scheduleFlexible}
                onChange={(next) => update("scheduleFlexible", next)}
                disabled={disabled}
              />
              <SwitchRow
                name="needsLiveInCare"
                label="Live-in care"
                hint="The caregiver would live in the home."
                checked={value.needsLiveInCare}
                onChange={(next) => update("needsLiveInCare", next)}
                disabled={disabled}
              />
              <SwitchRow
                name="needsEmergencyCover"
                label="Last-minute / emergency help"
                hint="Occasionally help may be needed at short notice."
                checked={value.needsEmergencyCover}
                onChange={(next) => update("needsEmergencyCover", next)}
                disabled={disabled}
              />
            </Stack>
          </FormSection>
        </>
      ) : null}

      <Divider />

      <FormSection
        title="Budget"
        description={
          oneTime
            ? "How much are you willing to pay for this visit?"
            : "Optional — helps us suggest caregivers within your budget."
        }
      >
        <FormControl disabled={disabled}>
          <FormLabel id="payment-type-label" sx={{ mb: 1 }}>
            How would you like to pay?
          </FormLabel>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={value.paymentType}
            onChange={(_event, next: PaymentType | null) => {
              if (next) update("paymentType", next, "budget");
            }}
            aria-labelledby="payment-type-label"
            disabled={disabled}
          >
            {PAYMENT_TYPE_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{ textTransform: "none", px: 2 }}
              >
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </FormControl>
        <TextField
          {...textFieldProps("budget")}
          label={
            oneTime
              ? "Maximum you would pay"
              : "Maximum you would pay (optional)"
          }
          placeholder={value.paymentType === "hourly" ? "e.g. 30" : "e.g. 120"}
          inputProps={{ inputMode: "decimal" }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                {budgetUnit(value.paymentType, oneTime)}
              </InputAdornment>
            ),
          }}
          value={value.budget}
          onChange={(event) => update("budget", event.target.value)}
          required={oneTime}
        />
      </FormSection>

      <Divider />

      <FormSection
        title="Special requirements"
        description={`Anything about ${name ? `${name}’s` : "their"} home or care a caregiver must be ready for.`}
      >
        <SwitchRow
          name="petsInHome"
          label="There are pets in the home"
          hint={
            needsPetCare
              ? "Included because pet care is selected."
              : "Important for caregivers with allergies."
          }
          checked={value.petsInHome || needsPetCare}
          onChange={(next) => update("petsInHome", next)}
          disabled={disabled || needsPetCare}
        />

        <CheckboxGroupField
          name="homeAccessibility"
          label="At home there is…"
          options={HOME_ACCESSIBILITY_OPTIONS}
          value={value.homeAccessibility}
          onChange={(next) => update("homeAccessibility", next)}
          helperText="Select all that apply."
          disabled={disabled}
        />

        <TextField
          {...textFieldProps("specialRequirements")}
          label="Care instructions (optional)"
          placeholder="Dietary needs, equipment such as a hoist, routines to keep, things to avoid…"
          value={value.specialRequirements}
          onChange={(event) =>
            update("specialRequirements", event.target.value)
          }
          multiline
          minRows={3}
          inputProps={{ maxLength: SPECIAL_REQUIREMENTS_MAX_LENGTH }}
          helperText={
            errors.specialRequirements ??
            `${value.specialRequirements.length} / ${SPECIAL_REQUIREMENTS_MAX_LENGTH}`
          }
        />
      </FormSection>

      <Divider />

      <FormSection
        title="Caregiver preferences"
        description="Only the gender preference is required; leave the rest empty if it does not matter."
      >
        <FieldRow>
          <FormControl
            fullWidth
            required
            disabled={disabled}
            error={Boolean(errors.preferredCaregiverGender)}
          >
            <InputLabel id="caregiver-gender-label">
              Caregiver gender
            </InputLabel>
            <Select
              labelId="caregiver-gender-label"
              label="Caregiver gender"
              name="preferredCaregiverGender"
              value={value.preferredCaregiverGender}
              onChange={(event) =>
                update(
                  "preferredCaregiverGender",
                  event.target.value as PreferredCaregiverGender,
                )
              }
            >
              {PREFERRED_CAREGIVER_GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.preferredCaregiverGender ? (
              <FormHelperText>{errors.preferredCaregiverGender}</FormHelperText>
            ) : null}
          </FormControl>

          <FormControl fullWidth disabled={disabled}>
            <InputLabel id="caregiver-language-label">
              Caregiver language
            </InputLabel>
            <Select
              labelId="caregiver-language-label"
              label="Caregiver language"
              name="preferredCaregiverLanguage"
              value={value.preferredCaregiverLanguage}
              onChange={(event) =>
                update(
                  "preferredCaregiverLanguage",
                  event.target.value as CareLanguage | "",
                )
              }
            >
              <MenuItem value="">
                <em>No preference</em>
              </MenuItem>
              {PREFERRED_LANGUAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FieldRow>

        <CheckboxGroupField
          name="requiredQualifications"
          label="Required qualifications (optional)"
          options={REQUIRED_QUALIFICATION_OPTIONS}
          value={value.requiredQualifications}
          onChange={(next) => update("requiredQualifications", next)}
          helperText="Only caregivers holding these will be suggested."
          disabled={disabled}
        />

        <FormControl fullWidth disabled={disabled}>
          {/* "No minimum" is a real (empty) choice: keep the label up. */}
          <InputLabel id="min-experience-label" shrink>
            Experience
          </InputLabel>
          <Select
            labelId="min-experience-label"
            label="Experience"
            notched
            name="minYearsExperience"
            value={value.minYearsExperience}
            onChange={(event) =>
              update("minYearsExperience", event.target.value)
            }
            displayEmpty
            renderValue={(selected) =>
              MIN_EXPERIENCE_OPTIONS.find((option) => option.value === selected)
                ?.label
            }
          >
            {MIN_EXPERIENCE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          {...textFieldProps("culturalConsiderations")}
          label="Cultural or religious considerations (optional)"
          placeholder="Traditions, holidays, dietary customs, anything a caregiver should respect…"
          value={value.culturalConsiderations}
          onChange={(event) =>
            update("culturalConsiderations", event.target.value)
          }
          multiline
          minRows={2}
          inputProps={{ maxLength: CULTURAL_CONSIDERATIONS_MAX_LENGTH }}
        />
      </FormSection>
    </>
  );
};

export default CareNeedsFields;
