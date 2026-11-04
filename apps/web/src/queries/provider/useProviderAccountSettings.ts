import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PROVIDER_OVERVIEW_QUERY,
  PROVIDER_PROFILE_QUERY,
  PROVIDER_UPDATE_ACCOUNT_SETTINGS_MUTATION,
} from "./keys";
import { updateProviderAccountSettings } from "./accountSettings";

export const useUpdateProviderAccountSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_UPDATE_ACCOUNT_SETTINGS_MUTATION,
    mutationFn: updateProviderAccountSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROVIDER_PROFILE_QUERY });
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
    },
  });
};
