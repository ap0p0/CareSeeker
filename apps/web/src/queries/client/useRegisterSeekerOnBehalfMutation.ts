import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorStatus,
  httpClient,
} from "../../api/httpClient";
import { ClientAuthApiError } from "./errors";
import { CLIENT_REGISTER_ON_BEHALF_MUTATION } from "./keys";
import { DUPLICATE_EMAIL_MESSAGE } from "./useRegisterSeekerMutation";

const REGISTER_SEEKER_ON_BEHALF_PATH = "/seeker/register/on-behalf" as const;

/**
 * How the registrant relates to the person they are seeking care for, read
 * from the registrant's side (`child` = "I am their child"). Mirrors the API
 * `RegistrantRelationship` enum.
 */
export type RegistrantRelationship =
  | "parent"
  | "child"
  | "spouse_partner"
  | "sibling"
  | "grandparent"
  | "grandchild"
  | "other_relative"
  | "friend_neighbor"
  | "legal_guardian"
  | "other";

/**
 * Step 1 of registering on behalf of someone else: the registrant (the
 * person opening the account). The password confirmation is checked
 * client-side only and never leaves the browser.
 */
export type RegisterSeekerOnBehalfPayload = {
  name: string;
  surname: string;
  email: string;
  password: string;
  /** E.164 US number, e.g. `+15551234567` */
  phone: string;
  relationship: RegistrantRelationship;
  /** Only sent when `relationship` is `other`. */
  relationshipOther?: string;
  /** Must be `true`: the registrant may arrange care for the recipient. */
  consentToActOnBehalf: true;
};

export type RegisterSeekerOnBehalfResult = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: "seeker";
  careFor: "other";
  registrant: {
    phone: string;
    relationship: RegistrantRelationship;
    relationshipOther: string | null;
    consentConfirmedAt: string;
  };
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

export const registerSeekerOnBehalf = async (
  payload: RegisterSeekerOnBehalfPayload,
): Promise<RegisterSeekerOnBehalfResult> => {
  try {
    const { data } = await httpClient.post<{
      data: RegisterSeekerOnBehalfResult;
    }>(REGISTER_SEEKER_ON_BEHALF_PATH, payload);

    return data.data;
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new ClientAuthApiError(DUPLICATE_EMAIL_MESSAGE, "DUPLICATE_EMAIL");
    }

    const code = getApiErrorCode(error);
    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not create your account. Please try again.",
      ),
      code === "VALIDATION_ERROR" ? "VALIDATION_ERROR" : "AUTH_SIGNUP_FAILED",
    );
  }
};

export const useRegisterSeekerOnBehalfMutation = (
  options?: Omit<
    UseMutationOptions<
      RegisterSeekerOnBehalfResult,
      ClientAuthApiError,
      RegisterSeekerOnBehalfPayload
    >,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CLIENT_REGISTER_ON_BEHALF_MUTATION,
    mutationFn: registerSeekerOnBehalf,
    ...options,
  });
