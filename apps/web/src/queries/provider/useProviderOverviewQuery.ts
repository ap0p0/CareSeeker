import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ProviderAuthApiError } from "./errors";
import { PROVIDER_OVERVIEW_QUERY } from "./keys";
import { fetchProviderOverview, type ProviderOverview } from "./overview";

export const useProviderOverviewQuery = (
  options?: Omit<
    UseQueryOptions<ProviderOverview, ProviderAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: PROVIDER_OVERVIEW_QUERY,
    queryFn: fetchProviderOverview,
    ...options,
  });
