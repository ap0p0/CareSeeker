import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { getApiErrorMessage, httpClient } from "../../api/httpClient";
import { ProviderAuthApiError } from "./errors";
import { PROVIDER_REGISTER_MUTATION } from "./keys";

const REGISTER_PROVIDER_PATH = "/provider/register" as const;

export type RegisterProviderPayload = {
  email: string;
  password: string;
};

export const registerProvider = async ({
  email,
  password,
}: RegisterProviderPayload): Promise<void> => {
  try {
    await httpClient.post(REGISTER_PROVIDER_PATH, { email, password });
  } catch (error) {
    throw new ProviderAuthApiError(
      getApiErrorMessage(
        error,
        "Could not create your account. Please try again.",
      ),
    );
  }
};

export const useRegisterProviderMutation = (
  options?: Omit<
    UseMutationOptions<void, ProviderAuthApiError, RegisterProviderPayload>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: PROVIDER_REGISTER_MUTATION,
    mutationFn: registerProvider,
    ...options,
  });
