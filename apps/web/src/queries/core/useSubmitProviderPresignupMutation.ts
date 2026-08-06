import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { CORE_PROVIDER_PRESIGNUP_MUTATION } from "./keys";
import { postPresignup } from "./presignupsShared";

export type ProviderPresignupPayload = {
  name: string;
  surname: string;
  email: string;
  state: string;
  city: string;
  phone?: string;
  accepted: boolean;
};

export const submitProviderPresignup = async (
  payload: ProviderPresignupPayload,
): Promise<void> => {
  await postPresignup("/presignups/provider", payload);
};

export const useSubmitProviderPresignupMutation = (
  options?: Omit<
    UseMutationOptions<void, Error, ProviderPresignupPayload>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CORE_PROVIDER_PRESIGNUP_MUTATION,
    mutationFn: submitProviderPresignup,
    ...options,
  });
