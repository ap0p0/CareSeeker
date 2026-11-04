import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ProviderAuthApiError } from "./errors";
import {
  PROVIDER_COMPLETE_ONBOARDING_MUTATION,
  PROVIDER_CONFIRM_PROFILE_MUTATION,
  PROVIDER_ONBOARDING_QUERY,
  PROVIDER_OVERVIEW_QUERY,
} from "./keys";
import {
  completeProviderOnboarding,
  confirmProviderProfile,
  fetchProviderOnboardingStatus,
  type ProviderOnboardingStatus,
} from "./onboarding";

export const useProviderOnboardingQuery = (
  options?: Omit<
    UseQueryOptions<ProviderOnboardingStatus, ProviderAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: PROVIDER_ONBOARDING_QUERY,
    queryFn: fetchProviderOnboardingStatus,
    ...options,
  });

export const useCompleteProviderOnboardingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_COMPLETE_ONBOARDING_MUTATION,
    mutationFn: completeProviderOnboarding,
    onSuccess: (status) => {
      queryClient.setQueryData(PROVIDER_ONBOARDING_QUERY, status);
    },
  });
};

export const useConfirmProviderProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_CONFIRM_PROFILE_MUTATION,
    mutationFn: confirmProviderProfile,
    onSuccess: (status) => {
      queryClient.setQueryData(PROVIDER_ONBOARDING_QUERY, status);
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
    },
  });
};
