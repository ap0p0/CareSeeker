import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";

/**
 * How a new job post starts:
 * - `prefill`: from the account (care recipient + saved care needs, with a
 *   generated title and description) — what registration opens;
 * - `blank`: an empty form.
 * Kept in the URL (`/jobs/new?mode=…`) so a reload keeps the choice and
 * "Back" returns to the choice. Without a (valid) mode the page asks.
 */
export type JobStartMode = "prefill" | "blank";

const MODE_PARAM = "mode";

export const parseJobStartMode = (
  searchParams: URLSearchParams,
): JobStartMode | null => {
  const mode = searchParams.get(MODE_PARAM);
  return mode === "prefill" || mode === "blank" ? mode : null;
};

/** `/jobs/new` (asks how to start) or `/jobs/new?mode=…`. */
export const newJobPath = (mode?: JobStartMode): string => {
  const path = SEEKER_ROUTE_PATHS[SeekerRoute.NewJob];
  return mode ? `${path}?${MODE_PARAM}=${mode}` : path;
};
