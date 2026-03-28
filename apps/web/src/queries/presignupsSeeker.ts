import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { postPresignup } from "./presignupsShared";
import { queryKeys } from "./queryKeys";

export type SeekerPresignupPayload = {
  name: string;
  surname: string;
  email: string;
  accepted: boolean;
};

export const submitSeekerPresignupMutation = async (
  payload: SeekerPresignupPayload
): Promise<void> => {
  await postPresignup("/presignups/seeker", payload);
};

export const useSubmitSeekerPresignupMutation = (
  options?: Omit<
    UseMutationOptions<void, Error, SeekerPresignupPayload>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.presignups.seeker(),
    mutationFn: submitSeekerPresignupMutation,
    ...options,
  });
