import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorStatus,
  httpClient,
} from "../../api/httpClient";
import { requireClientAuthHeaders } from "./authHeaders";
import { ClientAuthApiError } from "./errors";
import type { RegistrantRelationship } from "./useRegisterSeekerOnBehalfMutation";

export const SEEKER_REGISTRANT_PATH = "/seeker/registrant" as const;

/**
 * The registrant (account holder) of an account opened on behalf of someone
 * else — step 1, as stored.
 */
export type SeekerRegistrant = {
  name: string;
  surname: string;
  email: string;
  /** E.164 US number. */
  phone: string;
  relationship: RegistrantRelationship;
  relationshipOther: string | null;
  consentConfirmedAt: string;
  updatedAt: string;
};

/** Editable step 1 fields once the account exists (`PUT`). */
export type UpdateSeekerRegistrantPayload = {
  name: string;
  surname: string;
  phone: string;
  relationship: RegistrantRelationship;
  relationshipOther?: string;
};

/**
 * `null` when the account was registered for oneself (the API answers
 * `404 REGISTRANT_NOT_FOUND`), so callers can tell both kinds apart.
 */
export const fetchSeekerRegistrant =
  async (): Promise<SeekerRegistrant | null> => {
    const headers = await requireClientAuthHeaders();

    try {
      const { data } = await httpClient.get<SeekerRegistrant>(
        SEEKER_REGISTRANT_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      if (
        getApiErrorStatus(error) === 404 &&
        getApiErrorCode(error) === "REGISTRANT_NOT_FOUND"
      ) {
        return null;
      }

      throw new ClientAuthApiError(
        getApiErrorMessage(error, "Could not load your details."),
      );
    }
  };

export const updateSeekerRegistrant = async (
  payload: UpdateSeekerRegistrantPayload,
): Promise<SeekerRegistrant> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.put<{ data: SeekerRegistrant }>(
      SEEKER_REGISTRANT_PATH,
      payload,
      { headers },
    );
    return data.data;
  } catch (error) {
    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not save your details. Please try again.",
      ),
      getApiErrorCode(error) === "VALIDATION_ERROR"
        ? "VALIDATION_ERROR"
        : "UNKNOWN_ERROR",
    );
  }
};
