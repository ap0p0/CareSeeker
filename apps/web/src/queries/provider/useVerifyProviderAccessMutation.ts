import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  fetchProviderMe,
  type ProviderMeResult,
} from "../../services/provider/auth/providerMe";
import { ProviderAuthApiError } from "./errors";
import { PROVIDER_ME_MUTATION } from "./keys";

export const verifyProviderAccess = async (
  accessToken: string,
): Promise<ProviderMeResult> => fetchProviderMe(accessToken);

export const useVerifyProviderAccessMutation = (
  options?: Omit<
    UseMutationOptions<ProviderMeResult, ProviderAuthApiError, string>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: PROVIDER_ME_MUTATION,
    mutationFn: verifyProviderAccess,
    ...options,
  });
