import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { supabase } from "../supabase/supabase";
import { queryKeys } from "./queryKeys";
import {
  fetchProviderMe,
  type ProviderMeResult,
} from "../services/provider/auth/providerMe";
import { env } from "../config/env";

const REGISTER_PROVIDER_PATH = "/provider/register" as const;

export class ProviderAuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderAuthApiError";
  }
}

export type ProviderPasswordLoginPayload = {
  email: string;
  password: string;
};

export const signInProviderWithPassword = async ({
  email,
  password,
}: ProviderPasswordLoginPayload): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new ProviderAuthApiError(error.message);
  }
};

export const useSignInProviderMutation = (
  options?: Omit<
    UseMutationOptions<void, ProviderAuthApiError, ProviderPasswordLoginPayload>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.providerAuth.login(),
    mutationFn: signInProviderWithPassword,
    ...options,
  });

export type RegisterProviderPayload = {
  email: string;
  password: string;
};

export const registerProviderMutation = async ({
  email,
  password,
}: RegisterProviderPayload): Promise<void> => {
  const response = await fetch(`${env.apiBaseUrl}${REGISTER_PROVIDER_PATH}`, {
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

  throw new ProviderAuthApiError(
    message ?? "Could not create your account. Please try again."
  );
};

export const useRegisterProviderMutation = (
  options?: Omit<
    UseMutationOptions<void, ProviderAuthApiError, RegisterProviderPayload>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.providerAuth.register(),
    mutationFn: registerProviderMutation,
    ...options,
  });

export const verifyProviderAccessMutation = async (
  accessToken: string
): Promise<ProviderMeResult> => fetchProviderMe(accessToken);

export const useVerifyProviderAccessMutation = (
  options?: Omit<
    UseMutationOptions<ProviderMeResult, ProviderAuthApiError, string>,
    "mutationFn" | "mutationKey"
  >
) =>
  useMutation({
    mutationKey: queryKeys.providerAuth.providerMe(),
    mutationFn: verifyProviderAccessMutation,
    ...options,
  });
