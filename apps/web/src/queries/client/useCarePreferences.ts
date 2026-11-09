import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  fetchCarePreferences,
  saveCarePreferences,
  type CarePreferencesEnvelope,
  type CarePreferencesPayload,
} from "./carePreferences";
import type { ClientAuthApiError } from "./errors";
import {
  CLIENT_CARE_PREFERENCES_QUERY,
  CLIENT_SAVE_CARE_PREFERENCES_MUTATION,
  CLIENT_ONBOARDING_QUERY,
} from "./keys";

export const useCarePreferencesQuery = (
  options?: Omit<
    UseQueryOptions<CarePreferencesEnvelope, ClientAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: CLIENT_CARE_PREFERENCES_QUERY,
    queryFn: fetchCarePreferences,
    ...options,
  });

export const useSaveCarePreferencesMutation = (
  options?: Omit<
    UseMutationOptions<
      CarePreferencesEnvelope,
      ClientAuthApiError,
      CarePreferencesPayload
    >,
    "mutationFn" | "mutationKey"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CLIENT_SAVE_CARE_PREFERENCES_MUTATION,
    mutationFn: saveCarePreferences,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(CLIENT_CARE_PREFERENCES_QUERY, data);
      // The review page / onboarding gate read the aggregate status.
      void queryClient.invalidateQueries({ queryKey: CLIENT_ONBOARDING_QUERY });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
