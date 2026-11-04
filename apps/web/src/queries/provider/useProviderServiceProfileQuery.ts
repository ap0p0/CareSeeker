import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ProviderAuthApiError } from "./errors";
import { PROVIDER_SERVICE_PROFILE_QUERY } from "./keys";
import {
  fetchProviderServiceProfile,
  type ProviderServiceProfileEnvelope,
} from "./serviceProfile";

export const useProviderServiceProfileQuery = (
  options?: Omit<
    UseQueryOptions<ProviderServiceProfileEnvelope, ProviderAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: PROVIDER_SERVICE_PROFILE_QUERY,
    queryFn: fetchProviderServiceProfile,
    ...options,
  });
