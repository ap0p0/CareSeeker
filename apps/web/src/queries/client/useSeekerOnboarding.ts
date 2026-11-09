import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ClientAuthApiError } from "./errors";
import {
  CLIENT_COMPLETE_ONBOARDING_MUTATION,
  CLIENT_CONFIRM_PROFILE_MUTATION,
  CLIENT_ONBOARDING_QUERY,
} from "./keys";
import {
  completeSeekerOnboarding,
  confirmSeekerProfile,
  fetchSeekerOnboardingStatus,
  type SeekerOnboardingStatus,
} from "./onboarding";

export const useSeekerOnboardingQuery = (
  options?: Omit<
    UseQueryOptions<SeekerOnboardingStatus, ClientAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: CLIENT_ONBOARDING_QUERY,
    queryFn: fetchSeekerOnboardingStatus,
    ...options,
  });

type StatusMutationOptions = Omit<
  UseMutationOptions<SeekerOnboardingStatus, ClientAuthApiError, void>,
  "mutationFn" | "mutationKey"
>;

const useStatusMutation = (
  mutationKey: readonly string[],
  mutationFn: () => Promise<SeekerOnboardingStatus>,
  options?: StatusMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey,
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(CLIENT_ONBOARDING_QUERY, data);
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};

/** Every step saved → registration finished (opens the review page). */
export const useCompleteSeekerOnboardingMutation = (
  options?: StatusMutationOptions,
) =>
  useStatusMutation(
    CLIENT_COMPLETE_ONBOARDING_MUTATION,
    completeSeekerOnboarding,
    options,
  );

/** The seeker reviewed the summary and confirmed it. */
export const useConfirmSeekerProfileMutation = (
  options?: StatusMutationOptions,
) =>
  useStatusMutation(
    CLIENT_CONFIRM_PROFILE_MUTATION,
    confirmSeekerProfile,
    options,
  );
