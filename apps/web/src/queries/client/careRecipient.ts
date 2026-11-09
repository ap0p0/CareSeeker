import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import type { Gender } from "../../utils/gender";
import { requireClientAuthHeaders } from "./authHeaders";
import { ClientAuthApiError } from "./errors";

export const SEEKER_CARE_RECIPIENT_PATH = "/seeker/care-recipient" as const;

/** Mirrors the API `MobilityLevel` enum. */
export type MobilityLevel =
  | "independent"
  | "walking_aid"
  | "needs_assistance"
  | "wheelchair"
  | "bedbound";

/**
 * Step 2 of registering on behalf of someone else: the person receiving
 * care. Multi-selects are arrays of lower-cased option values; the "other"
 * texts are only sent when "other" is selected.
 */
export type CareRecipientPayload = {
  name: string;
  surname: string;
  /** `YYYY-MM-DD` */
  dateOfBirth: string;
  gender: Gender;
  addressLine1: string;
  city: string;
  /** USPS state code */
  state: string;
  /** ZIP or ZIP+4 */
  postalCode: string;
  livingSituation: string;
  mobilityLevel: MobilityLevel;
  languagesSpoken: string[];
  otherLanguage?: string;
  ethnicBackground: string;
  additionalInfo: string | null;
};

export type CareRecipient = Omit<
  CareRecipientPayload,
  "otherLanguage" | "livingSituation" | "mobilityLevel"
> & {
  livingSituation: string | null;
  mobilityLevel: MobilityLevel | null;
  otherLanguage: string | null;
  ethnicBackground: string | null;
  updatedAt: string;
};

export type CareRecipientEnvelope = {
  /** `false` until step 2 has been saved once. */
  completed: boolean;
  careRecipient: CareRecipient | null;
};

export const fetchCareRecipient = async (): Promise<CareRecipientEnvelope> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.get<CareRecipientEnvelope>(
      SEEKER_CARE_RECIPIENT_PATH,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not load the details of the person you care for.",
      ),
    );
  }
};

export const saveCareRecipient = async (
  payload: CareRecipientPayload,
): Promise<CareRecipientEnvelope> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.put<CareRecipientEnvelope>(
      SEEKER_CARE_RECIPIENT_PATH,
      payload,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ClientAuthApiError(
      getApiErrorMessage(
        error,
        "Could not save these details. Please try again.",
      ),
      getApiErrorCode(error) === "VALIDATION_ERROR"
        ? "VALIDATION_ERROR"
        : "UNKNOWN_ERROR",
    );
  }
};
