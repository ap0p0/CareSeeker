import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { ProviderAuthApiError } from "./errors";
import {
  PROVIDER_OVERVIEW_QUERY,
  PROVIDER_SAVE_SERVICE_PROFILE_MUTATION,
  PROVIDER_SERVICE_PROFILE_QUERY,
} from "./keys";
import {
  saveProviderServiceProfile,
  type ProviderServiceProfileEnvelope,
  type ProviderServiceProfilePayload,
} from "./serviceProfile";

export const useSaveProviderServiceProfileMutation = (
  options?: Omit<
    UseMutationOptions<
      ProviderServiceProfileEnvelope,
      ProviderAuthApiError,
      ProviderServiceProfilePayload
    >,
    "mutationFn" | "mutationKey"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_SAVE_SERVICE_PROFILE_MUTATION,
    mutationFn: saveProviderServiceProfile,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(PROVIDER_SERVICE_PROFILE_QUERY, data);
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
