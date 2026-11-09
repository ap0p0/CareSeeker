import dayjs from "dayjs";
import type { Option } from "./careOptions";

/** Human labels / formats for the option values stored by the API. */

export const labelFor = <T extends string>(
  options: readonly Option<T>[],
  value: string | null | undefined,
): string | null =>
  options.find((option) => option.value === value)?.label ?? null;

/** Labels of a multi-select; an `other` value shows its free text. */
export const labelsFor = <T extends string>(
  options: readonly Option<T>[],
  values: readonly string[],
  other?: string | null,
): string[] =>
  values.map((value) =>
    value === "other" && other
      ? `Other: ${other}`
      : (labelFor(options, value) ?? value),
  );

export const formatCents = (cents: number): string =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

/** `HH:mm` → `h:mm A`. */
export const formatClock = (value: string): string =>
  dayjs(`1970-01-01T${value}:00`).format("h:mm A");

export const formatTimeWindow = (window: {
  start: string;
  end: string;
  endsNextDay: boolean;
}): string =>
  `${formatClock(window.start)} – ${formatClock(window.end)}${
    window.endsNextDay ? " (next day)" : ""
  }`;

/** `YYYY-MM-DD` → e.g. `March 9, 1941`. */
export const formatLongDate = (value: string): string =>
  dayjs(value).format("MMMM D, YYYY");
