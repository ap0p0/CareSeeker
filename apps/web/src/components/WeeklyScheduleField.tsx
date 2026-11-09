import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {
  DAY_OPTIONS,
  MAX_WINDOWS_PER_DAY,
  type DayScheduleForm,
  type DayScheduleMode,
  type TimeWindowForm,
  type WeekScheduleForm,
} from "../utils/weeklySchedule";

/** A way of describing a day, as offered by a given flow. */
export type DayModeOption = {
  value: DayScheduleMode;
  label: string;
  hint: string;
};

type WeeklyScheduleFieldProps = {
  value: WeekScheduleForm;
  onChange: (next: WeekScheduleForm) => void;
  /** `days` (no day selected) and `day-<n>` (a day's windows). */
  errors: Partial<Record<string, string>>;
  /** Day modes this flow offers; the first one is the default. */
  modeOptions: DayModeOption[];
  /** Legend of the whole field. */
  label?: string;
  /** Shown for a day that is switched off. */
  offLabel?: string;
  /** Accessible name of a day's switch, e.g. "Available on Monday". */
  dayToggleLabel?: (dayLabel: string) => string;
  disabled?: boolean;
};

const EMPTY_WINDOW: TimeWindowForm = {
  start: null,
  end: null,
  endsNextDay: false,
};

/**
 * One row per weekday: a switch to turn the day on, then how the day should
 * be read — e.g. all day or specific hours (with overnight windows). Used for
 * provider availability and for the care schedule seekers request; each flow
 * passes the day modes it supports.
 */
const WeeklyScheduleField = ({
  value,
  onChange,
  errors,
  modeOptions,
  label = "Days you can work",
  offLabel = "Not available",
  dayToggleLabel = (dayLabel) => `Available on ${dayLabel}`,
  disabled = false,
}: WeeklyScheduleFieldProps) => {
  const defaultMode = modeOptions[0]?.value ?? "all_day";
  const updateDay = (day: number, patch: Partial<DayScheduleForm>) =>
    onChange({ ...value, [day]: { ...value[day], ...patch } });

  const updateWindow = (
    day: number,
    index: number,
    patch: Partial<TimeWindowForm>,
  ) =>
    updateDay(day, {
      windows: value[day].windows.map((window, i) =>
        i === index ? { ...window, ...patch } : window,
      ),
    });

  const enabledDays = DAY_OPTIONS.filter((day) => value[day.value].enabled);

  const applyToOtherDays = (source: number) => {
    const template = value[source];
    onChange(
      Object.fromEntries(
        Object.entries(value).map(([day, schedule]) => [
          day,
          schedule.enabled && Number(day) !== source
            ? {
                ...schedule,
                mode: template.mode,
                windows: template.windows.map((window) => ({ ...window })),
              }
            : schedule,
        ]),
      ),
    );
  };

  return (
    <FormControl
      component="fieldset"
      fullWidth
      required
      error={Boolean(errors.days)}
      disabled={disabled}
      data-field="days"
      tabIndex={-1}
      sx={{ outline: "none" }}
    >
      <FormLabel component="legend" sx={{ mb: 1 }}>
        {label}
      </FormLabel>

      <Stack spacing={1.25}>
        {DAY_OPTIONS.map((day) => {
          const schedule = value[day.value];
          const dayError = errors[`day-${day.value}`];
          const showWindows = schedule.enabled && schedule.mode !== "all_day";

          return (
            <Paper
              key={day.value}
              variant="outlined"
              data-field={`day-${day.value}`}
              tabIndex={-1}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                borderColor: dayError
                  ? "error.main"
                  : schedule.enabled
                    ? "primary.light"
                    : "divider",
                outline: "none",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: { md: 150 } }}
                >
                  <Switch
                    checked={schedule.enabled}
                    onChange={(event) =>
                      updateDay(day.value, {
                        enabled: event.target.checked,
                        ...(event.target.checked
                          ? {}
                          : { mode: defaultMode, windows: [] }),
                      })
                    }
                    disabled={disabled}
                    inputProps={{ "aria-label": dayToggleLabel(day.label) }}
                  />
                  <Typography
                    fontWeight={600}
                    color={schedule.enabled ? "text.primary" : "text.secondary"}
                  >
                    {day.label}
                  </Typography>
                </Stack>

                {schedule.enabled ? (
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={schedule.mode}
                    onChange={(_event, next: DayScheduleMode | null) => {
                      if (!next) return;
                      updateDay(day.value, {
                        mode: next,
                        windows:
                          next === "all_day"
                            ? []
                            : schedule.windows.length > 0
                              ? schedule.windows
                              : [EMPTY_WINDOW],
                      });
                    }}
                    disabled={disabled}
                    aria-label={`${day.label} schedule type`}
                    sx={{ flexWrap: "wrap" }}
                  >
                    {modeOptions.map((option) => (
                      <ToggleButton
                        key={option.value}
                        value={option.value}
                        sx={{ textTransform: "none", px: 1.5 }}
                      >
                        {option.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {offLabel}
                  </Typography>
                )}
              </Stack>

              {schedule.enabled ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.75 }}
                >
                  {
                    modeOptions.find((option) => option.value === schedule.mode)
                      ?.hint
                  }
                </Typography>
              ) : null}

              {showWindows ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {schedule.windows.map((window, index) => (
                    <Stack
                      key={index}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      <TimePicker
                        label="From"
                        value={window.start}
                        onChange={(next) =>
                          updateWindow(day.value, index, { start: next })
                        }
                        minutesStep={5}
                        disabled={disabled}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            name: `day-${day.value}-start-${index}`,
                          },
                        }}
                      />
                      <TimePicker
                        label={window.endsNextDay ? "To (next day)" : "To"}
                        value={window.end}
                        onChange={(next) =>
                          updateWindow(day.value, index, { end: next })
                        }
                        minutesStep={5}
                        disabled={disabled}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            name: `day-${day.value}-end-${index}`,
                          },
                        }}
                      />
                      <Tooltip title="Overnight: this window ends on the next day">
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={window.endsNextDay}
                              onChange={(event) =>
                                updateWindow(day.value, index, {
                                  endsNextDay: event.target.checked,
                                })
                              }
                              disabled={disabled}
                              inputProps={{
                                "aria-label": `${day.label} time window ${index + 1} ends next day`,
                              }}
                            />
                          }
                          label={
                            <Typography variant="caption" noWrap>
                              Ends next day
                            </Typography>
                          }
                          sx={{ mx: 0, flexShrink: 0 }}
                        />
                      </Tooltip>
                      <Tooltip title="Remove time window">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateDay(day.value, {
                                windows: schedule.windows.filter(
                                  (_item, i) => i !== index,
                                ),
                              })
                            }
                            disabled={disabled}
                            aria-label={`Remove ${day.label} time window ${index + 1}`}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  ))}
                  <Box>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        updateDay(day.value, {
                          windows: [...schedule.windows, EMPTY_WINDOW],
                        })
                      }
                      disabled={
                        disabled ||
                        schedule.windows.length >= MAX_WINDOWS_PER_DAY
                      }
                      sx={{ textTransform: "none" }}
                    >
                      Add time window
                    </Button>
                  </Box>
                </Stack>
              ) : null}

              {schedule.enabled && enabledDays.length > 1 ? (
                <Box sx={{ mt: 0.5 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => applyToOtherDays(day.value)}
                    disabled={disabled}
                    sx={{ textTransform: "none", color: "text.secondary" }}
                  >
                    Apply to all selected days
                  </Button>
                </Box>
              ) : null}

              {dayError ? (
                <FormHelperText error sx={{ mx: 0 }}>
                  {dayError}
                </FormHelperText>
              ) : null}
            </Paper>
          );
        })}
      </Stack>

      {errors.days ? <FormHelperText>{errors.days}</FormHelperText> : null}
    </FormControl>
  );
};

export default WeeklyScheduleField;
