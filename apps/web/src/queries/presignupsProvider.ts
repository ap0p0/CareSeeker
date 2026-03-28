import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { postPresignup } from "./presignupsShared";
import { queryKeys } from "./queryKeys";

export type ProviderPresignupPayload = {
  name: string;
  surname: string;
  email: string;
  state: string;
  city: string;
  phone?: string;
  accepted: boolean;
};

export const submitProviderPresignupMutation = async (
  payload: ProviderPresignupPayload
): Promise<void> => {
  await postPresignup("/presignups/provider", payload);
};

export const useSubmitProviderPresignupMutation = (
  options?: Omit<
    UseMutationOptions<void, Error, ProviderPresignupPayload>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.presignups.provider(),
    mutationFn: submitProviderPresignupMutation,
    ...options,
  });
