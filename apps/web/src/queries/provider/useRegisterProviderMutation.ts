import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorStatus,
  httpClient,
} from "../../api/httpClient";
import { ProviderAuthApiError } from "./errors";
import { PROVIDER_REGISTER_MUTATION } from "./keys";

const REGISTER_PROVIDER_PATH = "/provider/register" as const;

export const DUPLICATE_EMAIL_MESSAGE =
  "An account with this email already exists.";

export type ProviderGender =
  | "female"
  | "male"
  | "non_binary"
  | "prefer_not_to_say";

/**
 * Onboarding step 1 payload. Sent as `multipart/form-data` because it carries
 * the profile picture; every other field is a plain string. The password
 * confirmation is checked client-side only and never leaves the browser.
 */
export type RegisterProviderPayload = {
  name: string;
  surname: string;
  /** `YYYY-MM-DD` */
  dateOfBirth: string;
  gender: ProviderGender | "";
  email: string;
  password: string;
  /** E.164 US number, e.g. `+15551234567` */
  phone: string;
  addressLine1: string;
  city: string;
  /** USPS state code */
  state: string;
  /** ZIP or ZIP+4 */
  postalCode: string;
  profilePicture: File;
};

export type RegisterProviderResult = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: "provider";
  providerVerificationStatus: "pending" | "approved" | "rejected" | null;
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

const toFormData = ({
  profilePicture,
  ...fields
}: RegisterProviderPayload): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  formData.append("profilePicture", profilePicture, profilePicture.name);
  return formData;
};

export const registerProvider = async (
  payload: RegisterProviderPayload,
): Promise<RegisterProviderResult> => {
  try {
    const { data } = await httpClient.post<{ data: RegisterProviderResult }>(
      REGISTER_PROVIDER_PATH,
      toFormData(payload),
      // Let the browser set the multipart boundary instead of the JSON default.
      { headers: { "Content-Type": undefined } },
    );

    return data.data;
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new ProviderAuthApiError(
        DUPLICATE_EMAIL_MESSAGE,
        "DUPLICATE_EMAIL",
      );
    }

    const code = getApiErrorCode(error);
    throw new ProviderAuthApiError(
      getApiErrorMessage(
        error,
        "Could not create your account. Please try again.",
      ),
      code === "VALIDATION_ERROR" ? "VALIDATION_ERROR" : "AUTH_SIGNUP_FAILED",
    );
  }
};

export const useRegisterProviderMutation = (
  options?: Omit<
    UseMutationOptions<
      RegisterProviderResult,
      ProviderAuthApiError,
      RegisterProviderPayload
    >,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: PROVIDER_REGISTER_MUTATION,
    mutationFn: registerProvider,
    ...options,
  });
