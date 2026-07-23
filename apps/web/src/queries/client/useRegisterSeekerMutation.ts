import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorStatus,
  httpClient,
} from "../../api/httpClient";
import { ClientAuthApiError } from "./errors";
import { CLIENT_REGISTER_MUTATION } from "./keys";

const REGISTER_SEEKER_PATH = "/seeker/register" as const;

export const DUPLICATE_EMAIL_MESSAGE =
  "An account with this email already exists.";

export type RegisterSeekerPayload = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

const isDuplicateEmailError = (error: unknown): boolean => {
  const code = getApiErrorCode(error);
  if (code === "DUPLICATE_EMAIL" || code === "DUPLICATE_USER") {
    return true;
  }

  if (getApiErrorStatus(error) === 409) {
    return true;
  }

  const message = getApiErrorMessage(error, "").toLowerCase();
  return (
    message.includes("already been registered") ||
    message.includes("already exists") ||
    message.includes("already registered")
  );
};

export const registerSeeker = async ({
  name,
  surname,
  email,
  password,
}: RegisterSeekerPayload): Promise<void> => {
  try {
    await httpClient.post(REGISTER_SEEKER_PATH, {
      name,
      surname,
      email,
      password,
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new ClientAuthApiError(DUPLICATE_EMAIL_MESSAGE, "DUPLICATE_EMAIL");
    }

    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not create your account. Please try again.",
      ),
      "AUTH_SIGNUP_FAILED",
    );
  }
};

export const useRegisterSeekerMutation = (
  options?: Omit<
    UseMutationOptions<void, ClientAuthApiError, RegisterSeekerPayload>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CLIENT_REGISTER_MUTATION,
    mutationFn: registerSeeker,
    ...options,
  });
