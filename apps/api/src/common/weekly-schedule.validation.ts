import { DayAvailabilityMode } from '../../generated/prisma/client.js';
import { parseInteger, parseRequiredEnum } from './field-parsers';

/**
 * Weekly schedules: which weekdays, and for each day either "all day" or a
 * list of time windows. Shared by provider availability (onboarding step 4)
 * and the care schedule seekers request, so both sides are stored and
 * matched with the same rules.
 */

export const MAX_WINDOWS_PER_DAY = 6;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTES_PER_DAY = 24 * 60;

/**
 * `HH:mm` (zero-padded, 24h) window. Same-day windows have `start < end`;
 * overnight windows set `endsNextDay` and have `end <= start` (at most 24h),
 * e.g. `{ start: "22:00", end: "06:00", endsNextDay: true }`.
 */
export type TimeWindow = { start: string; end: string; endsNextDay: boolean };

export type ScheduleDayInput = {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  mode: DayAvailabilityMode;
  /** Empty for ALL_DAY; sorted and non-overlapping otherwise. */
  windows: TimeWindow[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Window as minutes from the day's midnight; overnight ends exceed 24h. */
function windowRange(window: TimeWindow): { start: number; end: number } {
  return {
    start: toMinutes(window.start),
    end: toMinutes(window.end) + (window.endsNextDay ? MINUTES_PER_DAY : 0),
  };
}

function parseWindow(
  value: unknown,
  field: string,
  errors: string[],
): TimeWindow | null {
  if (!isRecord(value)) {
    errors.push(`${field} must be an object with start and end`);
    return null;
  }
  const start = typeof value.start === 'string' ? value.start.trim() : '';
  const end = typeof value.end === 'string' ? value.end.trim() : '';
  const endsNextDay = value.endsNextDay === true;
  if (!TIME_REGEX.test(start) || !TIME_REGEX.test(end)) {
    errors.push(`${field} times must be in HH:mm format`);
    return null;
  }
  if (
    typeof value.endsNextDay !== 'undefined' &&
    typeof value.endsNextDay !== 'boolean'
  ) {
    errors.push(`${field}.endsNextDay must be true or false`);
    return null;
  }
  if (!endsNextDay && start >= end) {
    errors.push(
      `${field} must end after it starts (set endsNextDay for overnight hours)`,
    );
    return null;
  }
  if (endsNextDay && end > start) {
    errors.push(`${field} cannot be longer than 24 hours`);
    return null;
  }
  return { start, end, endsNextDay };
}

/**
 * Parses a weekly schedule: at least one day, each weekday at most once;
 * windows required for the window modes, ignored for ALL_DAY; windows sorted
 * and non-overlapping. `allowedModes` restricts the day modes a flow offers
 * (seekers cannot "block" hours, for instance).
 */
export function parseWeeklySchedule(
  value: unknown,
  field: string,
  errors: string[],
  allowedModes: readonly DayAvailabilityMode[] = Object.values(
    DayAvailabilityMode,
  ),
): ScheduleDayInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${field} must include at least one day`);
    return [];
  }

  const seen = new Set<number>();
  const days: ScheduleDayInput[] = [];

  value.forEach((entry, index) => {
    const entryField = `${field}[${index}]`;
    if (!isRecord(entry)) {
      errors.push(`${entryField} must be an object`);
      return;
    }

    const dayOfWeek = parseInteger(
      entry.dayOfWeek,
      `${entryField}.dayOfWeek`,
      errors,
      0,
      6,
    );
    if (dayOfWeek === null) return;
    if (seen.has(dayOfWeek)) {
      errors.push(
        `${entryField}.dayOfWeek ${dayOfWeek} is listed more than once`,
      );
      return;
    }
    seen.add(dayOfWeek);

    const mode = parseRequiredEnum(
      entry.mode,
      `${entryField}.mode`,
      allowedModes,
      errors,
    );
    if (!mode) return;

    const rawWindows = Array.isArray(entry.windows) ? entry.windows : [];
    if (mode === DayAvailabilityMode.ALL_DAY) {
      days.push({ dayOfWeek, mode, windows: [] });
      return;
    }

    if (rawWindows.length === 0) {
      errors.push(
        `${entryField}.windows must include at least one time window for this mode`,
      );
      return;
    }
    if (rawWindows.length > MAX_WINDOWS_PER_DAY) {
      errors.push(
        `${entryField}.windows may include at most ${MAX_WINDOWS_PER_DAY} windows`,
      );
      return;
    }

    const windows = rawWindows
      .map((window, windowIndex) =>
        parseWindow(window, `${entryField}.windows[${windowIndex}]`, errors),
      )
      .filter((window): window is TimeWindow => window !== null)
      .sort((a, b) => a.start.localeCompare(b.start));

    for (let i = 1; i < windows.length; i += 1) {
      if (windowRange(windows[i]).start < windowRange(windows[i - 1]).end) {
        errors.push(`${entryField}.windows must not overlap`);
        break;
      }
    }

    days.push({ dayOfWeek, mode, windows });
  });

  return days.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}
