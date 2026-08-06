import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";
import { ProviderAuthApiError } from "./errors";
import { PROVIDER_LOGIN_MUTATION } from "./keys";

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
    UseMutationOptions<
      void,
      ProviderAuthApiError,
      ProviderPasswordLoginPayload
    >,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: PROVIDER_LOGIN_MUTATION,
    mutationFn: signInProviderWithPassword,
    ...options,
  });
