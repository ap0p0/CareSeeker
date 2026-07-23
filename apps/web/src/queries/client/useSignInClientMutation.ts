import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";
import { ClientAuthApiError } from "./errors";
import { CLIENT_LOGIN_MUTATION } from "./keys";

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
  >,
) =>
  useMutation({
    mutationKey: CLIENT_LOGIN_MUTATION,
    mutationFn: signInClientWithPassword,
    ...options,
  });
