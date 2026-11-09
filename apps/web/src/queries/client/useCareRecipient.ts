import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  fetchCareRecipient,
  saveCareRecipient,
  type CareRecipientEnvelope,
  type CareRecipientPayload,
} from "./careRecipient";
import type { ClientAuthApiError } from "./errors";
import {
  CLIENT_CARE_RECIPIENT_QUERY,
  CLIENT_SAVE_CARE_RECIPIENT_MUTATION,
  CLIENT_ONBOARDING_QUERY,
} from "./keys";

export const useCareRecipientQuery = (
  options?: Omit<
    UseQueryOptions<CareRecipientEnvelope, ClientAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: CLIENT_CARE_RECIPIENT_QUERY,
    queryFn: fetchCareRecipient,
    ...options,
  });

export const useSaveCareRecipientMutation = (
  options?: Omit<
    UseMutationOptions<
      CareRecipientEnvelope,
      ClientAuthApiError,
      CareRecipientPayload
    >,
    "mutationFn" | "mutationKey"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CLIENT_SAVE_CARE_RECIPIENT_MUTATION,
    mutationFn: saveCareRecipient,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(CLIENT_CARE_RECIPIENT_QUERY, data);
      // The review page / onboarding gate read the aggregate status.
      void queryClient.invalidateQueries({ queryKey: CLIENT_ONBOARDING_QUERY });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
