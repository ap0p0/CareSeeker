import type { FormEvent } from "react";
import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FormSection, SwitchRow } from "../../../../../components/FormLayout";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type {
  AvailabilityStart,
  VehicleType,
  WorkType,
} from "../../../../../queries/provider";
import WeeklyScheduleField from "../../../../../components/WeeklyScheduleField";
import { focusFirstInvalidField } from "../../../../../utils/focusField";
import type {
  ProviderWorkPreferencesErrors,
  ProviderWorkPreferencesForm,
} from "../types";
import { validateProviderWorkPreferences } from "../validation";
import {
  AVAILABILITY_START_OPTIONS,
  DAY_MODE_OPTIONS,
  MATCHING_NOTES_MAX_LENGTH,
  MAX_TRAVEL_DISTANCE_MILES,
  MAX_WEEKLY_HOURS,
  VEHICLE_TYPE_OPTIONS,
  WORK_TYPE_OPTIONS,
} from "../workPreferenceOptions";

type ProviderWorkPreferencesStepProps = {
  value: ProviderWorkPreferencesForm;
  onChange: (next: ProviderWorkPreferencesForm) => void;
  onSubmit: () => Promise<void>;
  /** Hidden outside the onboarding flow. */
  onBack?: () => void;
  submitting: boolean;
  submitLabel: string;
  /** Saved data still loading (resume / back navigation). */
  loading?: boolean;
  /**
   * Saved data could not be loaded. The form is not shown and nothing can be
   * saved until a retry succeeds, so stored preferences are never replaced
   * by defaults by accident.
   */
  loadError?: string | null;
  onRetryLoad?: () => void;
  retryingLoad?: boolean;
  /** Server / flow error shown above the form. */
  error: string | null;
};

const FIELD_ORDER = [
  "days",
  ...[1, 2, 3, 4, 5, 6, 0].map((day) => `day-${day}`),
  "workType",
  "availableFrom",
  "compensation",
  "jobFrequency",
  "maxTravelDistanceMiles",
  "vehicleType",
  "minWeeklyHours",
  "maxWeeklyHours",
  "preferredHourlyRate",
  "minHourlyRate",
  "matchingNotes",
];

const DISTANCE_MARKS = [5, 25, 50, 75, 100].map((miles) => ({
  value: miles,
  label: `${miles} mi`,
}));

const ProviderWorkPreferencesStep = ({
  value,
  onChange,
  onSubmit,
  onBack,
  submitting,
  submitLabel,
  loading = false,
  loadError = null,
  onRetryLoad,
  retryingLoad = false,
  error,
}: ProviderWorkPreferencesStepProps) => {
  const [fieldErrors, setFieldErrors] = useState<ProviderWorkPreferencesErrors>(
    {},
  );

  const clearErrors = (...keys: string[]) => {
    if (!keys.some((key) => fieldErrors[key])) return;
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of keys) delete next[key];
      return next;
    });
  };

  const update = <K extends keyof ProviderWorkPreferencesForm>(
    field: K,
    fieldValue: ProviderWorkPreferencesForm[K],
    ...errorKeys: string[]
  ) => {
    onChange({ ...value, [field]: fieldValue });
    clearErrors(field, ...errorKeys);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateProviderWorkPreferences(value);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(FIELD_ORDER, errors);
      return;
    }

    await onSubmit();
  };

  const textFieldProps = (field: keyof ProviderWorkPreferencesForm) => ({
    name: field,
    error: Boolean(fieldErrors[field]),
    helperText: fieldErrors[field],
    fullWidth: true,
    disabled: submitting,
  });

  if (loading) {
    return (
      <Stack alignItems="center" py={6} spacing={1.5}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Loading your saved availability…
        </Typography>
      </Stack>
    );
  }

  if (loadError) {
    return (
      <Stack spacing={2.5} data-testid="work-preferences-load-error">
        <Alert severity="error">
          {loadError} To protect what you saved before, this step can only be
          edited once it has loaded.
        </Alert>
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
            type="button"
            variant="contained"
            onClick={onRetryLoad}
            disabled={retryingLoad || !onRetryLoad}
            startIcon={
              retryingLoad ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            Try again
          </Button>
        </Stack>
      </Stack>
    );
  }

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
        are required. We use these to only suggest jobs that fit when, where and
        how you want to work.
      </Typography>

      <FormSection
        spacing={2.5}
        title="Weekly availability"
        description="Turn on the days you can work. For each day choose all day, the hours you are available, or block the hours you can never work."
      >
        <WeeklyScheduleField
          value={value.days}
          onChange={(days) => {
            onChange({ ...value, days });
            clearErrors(
              "days",
              ...Object.keys(days).map((day) => `day-${day}`),
            );
          }}
          errors={fieldErrors}
          modeOptions={DAY_MODE_OPTIONS}
          disabled={submitting}
        />
      </FormSection>

      <Divider />

      <FormSection spacing={2.5} title="Work preferences">
        <FormControl
          required
          error={Boolean(fieldErrors.workType)}
          disabled={submitting}
          data-field="workType"
          tabIndex={-1}
          sx={{ outline: "none" }}
        >
          <FormLabel sx={{ mb: 1 }}>How much do you want to work?</FormLabel>
          <ToggleButtonGroup
            exclusive
            value={value.workType}
            onChange={(_event, next: WorkType | null) => {
              if (next) update("workType", next);
            }}
            disabled={submitting}
            aria-label="Work type"
            sx={{ flexWrap: "wrap" }}
          >
            {WORK_TYPE_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{ textTransform: "none", px: 2.5 }}
              >
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {fieldErrors.workType ? (
            <FormHelperText>{fieldErrors.workType}</FormHelperText>
          ) : null}
        </FormControl>

        <FormControl
          required
          disabled={submitting}
          error={Boolean(fieldErrors.availableFrom)}
        >
          <FormLabel>When can you start?</FormLabel>
          <RadioGroup
            value={value.availabilityStart}
            onChange={(event) =>
              update(
                "availabilityStart",
                event.target.value as AvailabilityStart,
                "availableFrom",
              )
            }
          >
            {AVAILABILITY_START_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {value.availabilityStart === "specific_date" ? (
            <DatePicker
              label="Start date"
              value={value.availableFrom}
              onChange={(next) => update("availableFrom", next)}
              disablePast
              disabled={submitting}
              slotProps={{
                textField: {
                  name: "availableFrom",
                  required: true,
                  error: Boolean(fieldErrors.availableFrom),
                  helperText: fieldErrors.availableFrom,
                  sx: { mt: 1, maxWidth: { sm: 280 } },
                },
              }}
            />
          ) : null}
        </FormControl>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl
            component="fieldset"
            required
            disabled={submitting}
            error={Boolean(fieldErrors.compensation)}
            data-field="compensation"
            tabIndex={-1}
            sx={{ flex: 1, outline: "none" }}
          >
            <FormLabel component="legend">
              How do you want to be paid?
            </FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value.acceptsHourly}
                    onChange={(event) =>
                      update(
                        "acceptsHourly",
                        event.target.checked,
                        "compensation",
                      )
                    }
                  />
                }
                label="Hourly"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value.acceptsFixedPrice}
                    onChange={(event) =>
                      update(
                        "acceptsFixedPrice",
                        event.target.checked,
                        "compensation",
                      )
                    }
                  />
                }
                label="Fixed price per job"
              />
            </FormGroup>
            {fieldErrors.compensation ? (
              <FormHelperText>{fieldErrors.compensation}</FormHelperText>
            ) : null}
          </FormControl>

          <FormControl
            component="fieldset"
            required
            disabled={submitting}
            error={Boolean(fieldErrors.jobFrequency)}
            data-field="jobFrequency"
            tabIndex={-1}
            sx={{ flex: 1, outline: "none" }}
          >
            <FormLabel component="legend">Jobs you accept</FormLabel>
            <FormGroup>
              {(
                [
                  ["acceptsOneTimeJobs", "One-time jobs"],
                  ["acceptsDailyJobs", "Recurring — daily"],
                  ["acceptsWeeklyJobs", "Recurring — weekly"],
                  ["acceptsMonthlyJobs", "Recurring — monthly"],
                ] as const
              ).map(([field, label]) => (
                <FormControlLabel
                  key={field}
                  control={
                    <Checkbox
                      checked={value[field]}
                      onChange={(event) =>
                        update(field, event.target.checked, "jobFrequency")
                      }
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup>
            {fieldErrors.jobFrequency ? (
              <FormHelperText>{fieldErrors.jobFrequency}</FormHelperText>
            ) : null}
          </FormControl>
        </Stack>

        <FormControl component="fieldset" disabled={submitting}>
          <FormLabel component="legend" sx={{ mb: 0.5 }}>
            Also available for
          </FormLabel>
          <Stack spacing={0.5}>
            <SwitchRow
              label="Overnight care"
              checked={value.availableOvernight}
              onChange={(next) => update("availableOvernight", next)}
              disabled={submitting}
            />
            <SwitchRow
              label="Live-in care"
              checked={value.availableLiveIn}
              onChange={(next) => update("availableLiveIn", next)}
              disabled={submitting}
            />
            <SwitchRow
              label="Emergency / short-notice requests"
              checked={value.availableEmergency}
              onChange={(next) => update("availableEmergency", next)}
              disabled={submitting}
            />
          </Stack>
        </FormControl>
      </FormSection>

      <Divider />

      <FormSection
        spacing={2.5}
        title="Location & travel"
        description="Distances are measured from the home address you gave us."
      >
        <FormControl
          fullWidth
          required
          disabled={submitting}
          error={Boolean(fieldErrors.maxTravelDistanceMiles)}
          data-field="maxTravelDistanceMiles"
          tabIndex={-1}
          sx={{ outline: "none" }}
        >
          <FormLabel id="travel-distance-label">
            Maximum travel distance: {value.maxTravelDistanceMiles} miles
          </FormLabel>
          <Box sx={{ px: 1, pt: 1 }}>
            <Slider
              aria-labelledby="travel-distance-label"
              value={value.maxTravelDistanceMiles}
              onChange={(_event, next) =>
                update(
                  "maxTravelDistanceMiles",
                  Array.isArray(next) ? next[0] : next,
                )
              }
              min={1}
              max={MAX_TRAVEL_DISTANCE_MILES}
              step={1}
              marks={DISTANCE_MARKS}
              valueLabelDisplay="auto"
              disabled={submitting}
            />
          </Box>
          {fieldErrors.maxTravelDistanceMiles ? (
            <FormHelperText>
              {fieldErrors.maxTravelDistanceMiles}
            </FormHelperText>
          ) : null}
        </FormControl>

        <SwitchRow
          label="I can drive clients with my own vehicle"
          hint="Errands, appointments or transport as part of the job."
          checked={value.offersTransportation}
          onChange={(next) =>
            onChange({
              ...value,
              offersTransportation: next,
              ...(next
                ? {}
                : { vehicleType: "", vehicleWheelchairAccessible: false }),
            })
          }
          disabled={submitting}
        />

        {value.offersTransportation ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <FormControl
              fullWidth
              required
              disabled={submitting}
              error={Boolean(fieldErrors.vehicleType)}
              sx={{ maxWidth: { sm: 280 } }}
            >
              <InputLabel id="vehicle-type-label">Vehicle type</InputLabel>
              <Select
                labelId="vehicle-type-label"
                label="Vehicle type"
                name="vehicleType"
                value={value.vehicleType}
                onChange={(event) =>
                  update("vehicleType", event.target.value as VehicleType | "")
                }
              >
                {VEHICLE_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.vehicleType ? (
                <FormHelperText>{fieldErrors.vehicleType}</FormHelperText>
              ) : null}
            </FormControl>
            <SwitchRow
              label="Wheelchair accessible"
              checked={value.vehicleWheelchairAccessible}
              onChange={(next) => update("vehicleWheelchairAccessible", next)}
              disabled={submitting}
            />
          </Stack>
        ) : null}
      </FormSection>

      <Divider />

      <FormSection
        spacing={2.5}
        title="Hours & pay"
        description="Per single job. Rates are in US dollars per hour."
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            {...textFieldProps("minWeeklyHours")}
            label="Minimum hours per week"
            type="number"
            inputProps={{ min: 1, max: MAX_WEEKLY_HOURS, step: 1 }}
            value={value.minWeeklyHours}
            onChange={(event) =>
              update("minWeeklyHours", event.target.value, "maxWeeklyHours")
            }
            required
          />
          <TextField
            {...textFieldProps("maxWeeklyHours")}
            label="Maximum hours per week"
            type="number"
            inputProps={{ min: 1, max: MAX_WEEKLY_HOURS, step: 1 }}
            value={value.maxWeeklyHours}
            onChange={(event) => update("maxWeeklyHours", event.target.value)}
            required
          />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            {...textFieldProps("preferredHourlyRate")}
            label="Preferred hourly rate"
            inputProps={{ inputMode: "decimal" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            value={value.preferredHourlyRate}
            onChange={(event) =>
              update("preferredHourlyRate", event.target.value, "minHourlyRate")
            }
            required
          />
          <TextField
            {...textFieldProps("minHourlyRate")}
            label="Minimum hourly rate"
            inputProps={{ inputMode: "decimal" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            value={value.minHourlyRate}
            onChange={(event) => update("minHourlyRate", event.target.value)}
            required
            helperText={
              fieldErrors.minHourlyRate ??
              "We will not suggest jobs paying less than this."
            }
          />
        </Stack>
      </FormSection>

      <Divider />

      <FormSection spacing={2.5} title="Anything else?">
        <TextField
          {...textFieldProps("matchingNotes")}
          label="Notes for matching (optional)"
          placeholder="Anything we should consider when matching you with a client — e.g. no pets, prefer female clients, need public transport access…"
          value={value.matchingNotes}
          onChange={(event) => update("matchingNotes", event.target.value)}
          multiline
          minRows={3}
          inputProps={{ maxLength: MATCHING_NOTES_MAX_LENGTH }}
          helperText={
            fieldErrors.matchingNotes ??
            `${value.matchingNotes.trim().length}/${MATCHING_NOTES_MAX_LENGTH} characters`
          }
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
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProviderWorkPreferencesStep;
