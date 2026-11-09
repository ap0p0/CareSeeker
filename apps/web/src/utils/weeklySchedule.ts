import dayjs, { type Dayjs } from "dayjs";

/**
 * Weekly schedules (which weekdays, all day or within time windows) shared by
 * provider availability and the care schedule seekers request. Mirrors the
 * API (`apps/api/src/common/weekly-schedule.validation.ts`).
 */

/** API day modes (lower-cased). Seekers only use the first two. */
export type DayScheduleMode =
  | "all_day"
  | "available_windows"
  | "blocked_windows";

/** 0 = Sunday … 6 = Saturday (same convention as the API); shown Mon → Sun. */
export const DAY_OPTIONS: { value: number; label: string; short: string }[] = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

export const MAX_WINDOWS_PER_DAY = 6;
export const TIME_FORMAT = "HH:mm";

export type TimeWindowForm = {
  start: Dayjs | null;
  end: Dayjs | null;
  /** The window ends on the following day (overnight hours). */
  endsNextDay: boolean;
};

export type DayScheduleForm = {
  enabled: boolean;
  mode: DayScheduleMode;
  windows: TimeWindowForm[];
};

/** Keyed by day of week (0 = Sunday … 6 = Saturday). */
export type WeekScheduleForm = Record<number, DayScheduleForm>;

/** What the API sends / accepts for one day. */
export type ScheduleDay = {
  dayOfWeek: number;
  mode: DayScheduleMode;
  windows: { start: string; end: string; endsNextDay: boolean }[];
};

export const EMPTY_DAY_SCHEDULE: DayScheduleForm = {
  enabled: false,
  mode: "all_day",
  windows: [],
};

export const EMPTY_WEEK_SCHEDULE: WeekScheduleForm = Object.fromEntries(
  [0, 1, 2, 3, 4, 5, 6].map((day) => [day, EMPTY_DAY_SCHEDULE]),
);

export const formatTime = (value: Dayjs): string => value.format(TIME_FORMAT);

export const timeFromString = (value: string): Dayjs =>
  dayjs(`1970-01-01T${value}:00`);

/** Saved days → form (every weekday present, unsaved ones disabled). */
export const weekScheduleFromSaved = (
  days: readonly ScheduleDay[],
): WeekScheduleForm =>
  Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const saved = days.find((item) => item.dayOfWeek === day);
      return [
        day,
        saved
          ? {
              enabled: true,
              mode: saved.mode,
              windows: saved.windows.map((window) => ({
                start: timeFromString(window.start),
                end: timeFromString(window.end),
                endsNextDay: window.endsNextDay,
              })),
            }
          : EMPTY_DAY_SCHEDULE,
      ];
    }),
  );

/** Form → API payload: enabled days only, no windows for "all day". */
export const toScheduleDaysPayload = (week: WeekScheduleForm): ScheduleDay[] =>
  Object.entries(week)
    .filter(([, day]) => day.enabled)
    .map(([day, schedule]) => ({
      dayOfWeek: Number(day),
      mode: schedule.mode,
      windows:
        schedule.mode === "all_day"
          ? []
          : schedule.windows.map((window) => ({
              // Validated before submitting.
              start: window.start ? formatTime(window.start) : "",
              end: window.end ? formatTime(window.end) : "",
              endsNextDay: window.endsNextDay,
            })),
    }));

/** One message for a day's windows, or `undefined` when they are valid. */
export const validateTimeWindows = (
  windows: TimeWindowForm[],
): string | undefined => {
  if (windows.length === 0) return "Add at least one time window.";
  if (windows.length > MAX_WINDOWS_PER_DAY) {
    return `Use at most ${MAX_WINDOWS_PER_DAY} time windows per day.`;
  }

  const parsed: { start: number; end: number }[] = [];
  for (const window of windows) {
    if (!window.start?.isValid() || !window.end?.isValid()) {
      return "Each time window needs a valid start and end time.";
    }
    const start = window.start.hour() * 60 + window.start.minute();
    const sameDayEnd = window.end.hour() * 60 + window.end.minute();
    if (!window.endsNextDay && start >= sameDayEnd) {
      return "A time window must end after it starts — turn on “Ends next day” for overnight hours.";
    }
    if (window.endsNextDay && sameDayEnd > start) {
      return "An overnight window cannot be longer than 24 hours.";
    }
    // Overnight ends are counted past midnight so overlap checks still work.
    parsed.push({
      start,
      end: sameDayEnd + (window.endsNextDay ? 24 * 60 : 0),
    });
  }

  parsed.sort((a, b) => a.start - b.start);
  for (let i = 1; i < parsed.length; i += 1) {
    if (parsed[i].start < parsed[i - 1].end) {
      return "Time windows must not overlap.";
    }
  }

  return undefined;
};

/**
 * Errors keyed `days` (no day selected) and `day-<n>` (a day's windows), the
 * keys `WeeklyScheduleField` displays and focuses.
 */
export const validateWeekSchedule = (
  week: WeekScheduleForm,
  noDaysMessage: string,
): Partial<Record<string, string>> => {
  const errors: Partial<Record<string, string>> = {};
  const enabledDays = Object.entries(week).filter(([, day]) => day.enabled);

  if (enabledDays.length === 0) {
    errors.days = noDaysMessage;
  }
  for (const [day, schedule] of enabledDays) {
    if (schedule.mode === "all_day") continue;
    const windowError = validateTimeWindows(schedule.windows);
    if (windowError) errors[`day-${day}`] = windowError;
  }

  return errors;
};
