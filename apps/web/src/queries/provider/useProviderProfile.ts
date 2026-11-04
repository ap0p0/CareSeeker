import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ProviderAuthApiError } from "./errors";
import {
  PROVIDER_OVERVIEW_QUERY,
  PROVIDER_PROFILE_QUERY,
  PROVIDER_UPDATE_PROFILE_MUTATION,
  PROVIDER_UPDATE_PROFILE_PICTURE_MUTATION,
} from "./keys";
import {
  fetchProviderProfile,
  updateProviderProfile,
  updateProviderProfilePicture,
  type ProviderProfile,
} from "./profile";

export const useProviderProfileQuery = (
  options?: Omit<
    UseQueryOptions<ProviderProfile, ProviderAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: PROVIDER_PROFILE_QUERY,
    queryFn: fetchProviderProfile,
    ...options,
  });

const useProfileCacheSync = () => {
  const queryClient = useQueryClient();
  return (profile: ProviderProfile) => {
    queryClient.setQueryData(PROVIDER_PROFILE_QUERY, profile);
    // The overview embeds the profile; refresh it lazily.
    void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
  };
};

export const useUpdateProviderProfileMutation = () => {
  const sync = useProfileCacheSync();
  return useMutation({
    mutationKey: PROVIDER_UPDATE_PROFILE_MUTATION,
    mutationFn: updateProviderProfile,
    onSuccess: sync,
  });
};

export const useUpdateProviderProfilePictureMutation = () => {
  const sync = useProfileCacheSync();
  return useMutation({
    mutationKey: PROVIDER_UPDATE_PROFILE_PICTURE_MUTATION,
    mutationFn: updateProviderProfilePicture,
    onSuccess: sync,
  });
};
