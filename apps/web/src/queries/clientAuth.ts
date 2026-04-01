import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { supabase } from "../supabase/supabase";
import { queryKeys } from "./queryKeys";
import { fetchSeekerMe, type SeekerMeResult } from "../services/client/auth/seekerMe";
import { env } from "../config/env";

const REGISTER_SEEKER_PATH = "/seeker/register" as const;

export class ClientAuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientAuthApiError";
  }
}

export type ClientPasswordLoginPayload = {
  email: string;
  password: string;
};

export const signInClientWithPassword = async ({
  email,
  password,
}: ClientPasswordLoginPayload): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new ClientAuthApiError(error.message);
  }
};

export const useSignInClientMutation = (
  options?: Omit<
    UseMutationOptions<void, ClientAuthApiError, ClientPasswordLoginPayload>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.clientAuth.login(),
    mutationFn: signInClientWithPassword,
    ...options,
  });

export type RegisterSeekerPayload = {
  email: string;
  password: string;
};

export const registerSeekerMutation = async ({
  email,
  password,
}: RegisterSeekerPayload): Promise<void> => {
  const response = await fetch(`${env.apiBaseUrl}${REGISTER_SEEKER_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    return;
  }

  const data = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  const message = Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message;

  throw new ClientAuthApiError(
    message ?? "Could not create your account. Please try again."
  );
};

export const useRegisterSeekerMutation = (
  options?: Omit<
    UseMutationOptions<void, ClientAuthApiError, RegisterSeekerPayload>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.clientAuth.register(),
    mutationFn: registerSeekerMutation,
    ...options,
  });

export const verifySeekerAccessMutation = async (
  accessToken: string
): Promise<SeekerMeResult> => fetchSeekerMe(accessToken);

export const useVerifySeekerAccessMutation = (
  options?: Omit<
    UseMutationOptions<SeekerMeResult, ClientAuthApiError, string>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.clientAuth.seekerMe(),
    mutationFn: verifySeekerAccessMutation,
    ...options,
  });
