import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { CORE_SEEKER_PRESIGNUP_MUTATION } from "./keys";
import { postPresignup } from "./presignupsShared";

export type SeekerPresignupPayload = {
  name: string;
  surname: string;
  email: string;
  accepted: boolean;
};

export const submitSeekerPresignup = async (
  payload: SeekerPresignupPayload,
): Promise<void> => {
  await postPresignup("/presignups/seeker", payload);
};

export const useSubmitSeekerPresignupMutation = (
  options?: Omit<
    UseMutationOptions<void, Error, SeekerPresignupPayload>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CORE_SEEKER_PRESIGNUP_MUTATION,
    mutationFn: submitSeekerPresignup,
    ...options,
  });
