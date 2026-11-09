import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ClientAuthApiError } from "./errors";
import {
  CLIENT_REGISTRANT_QUERY,
  CLIENT_UPDATE_REGISTRANT_MUTATION,
  CLIENT_ONBOARDING_QUERY,
} from "./keys";
import {
  fetchSeekerRegistrant,
  updateSeekerRegistrant,
  type SeekerRegistrant,
  type UpdateSeekerRegistrantPayload,
} from "./registrant";

/** `null` data means the account was registered for oneself. */
export const useSeekerRegistrantQuery = (
  options?: Omit<
    UseQueryOptions<SeekerRegistrant | null, ClientAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: CLIENT_REGISTRANT_QUERY,
    queryFn: fetchSeekerRegistrant,
    ...options,
  });

export const useUpdateSeekerRegistrantMutation = (
  options?: Omit<
    UseMutationOptions<
      SeekerRegistrant,
      ClientAuthApiError,
      UpdateSeekerRegistrantPayload
    >,
    "mutationFn" | "mutationKey"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CLIENT_UPDATE_REGISTRANT_MUTATION,
    mutationFn: updateSeekerRegistrant,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(CLIENT_REGISTRANT_QUERY, data);
      // The review page / onboarding gate read the aggregate status.
      void queryClient.invalidateQueries({ queryKey: CLIENT_ONBOARDING_QUERY });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
