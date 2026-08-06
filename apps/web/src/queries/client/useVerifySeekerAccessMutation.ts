import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  fetchSeekerMe,
  type SeekerMeResult,
} from "../../services/client/auth/seekerMe";
import { ClientAuthApiError } from "./errors";
import { CLIENT_SEEKER_ME_MUTATION } from "./keys";

export const verifySeekerAccess = async (
  accessToken: string,
): Promise<SeekerMeResult> => fetchSeekerMe(accessToken);

export const useVerifySeekerAccessMutation = (
  options?: Omit<
    UseMutationOptions<SeekerMeResult, ClientAuthApiError, string>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CLIENT_SEEKER_ME_MUTATION,
    mutationFn: verifySeekerAccess,
    ...options,
  });
