import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ProviderAuthApiError } from "./errors";
import {
  PROVIDER_OVERVIEW_QUERY,
  PROVIDER_SAVE_WORK_PREFERENCES_MUTATION,
  PROVIDER_WORK_PREFERENCES_QUERY,
} from "./keys";
import {
  fetchProviderWorkPreferences,
  saveProviderWorkPreferences,
  type ProviderWorkPreferencesEnvelope,
} from "./workPreferences";

export const useProviderWorkPreferencesQuery = (
  options?: Omit<
    UseQueryOptions<ProviderWorkPreferencesEnvelope, ProviderAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: PROVIDER_WORK_PREFERENCES_QUERY,
    queryFn: fetchProviderWorkPreferences,
    ...options,
  });

export const useSaveProviderWorkPreferencesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_SAVE_WORK_PREFERENCES_MUTATION,
    mutationFn: saveProviderWorkPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(PROVIDER_WORK_PREFERENCES_QUERY, data);
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
    },
  });
};
