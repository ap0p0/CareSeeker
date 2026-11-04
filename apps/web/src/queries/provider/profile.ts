import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import { ProviderAuthApiError } from "./errors";
import type { ProviderGender } from "./useRegisterProviderMutation";

export const PROVIDER_PROFILE_PATH = "/provider/profile" as const;

export type ProviderProfileAddress = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
};

/** Identity + step 1 personal information as returned by the API. */
export type ProviderProfile = {
  id: string;
  userId: string;
  name: string;
  surname: string;
  email: string;
  /** `YYYY-MM-DD` */
  dateOfBirth: string | null;
  gender: ProviderGender | null;
  phone: string | null;
  address: ProviderProfileAddress | null;
  /** Short-lived signed URL; re-fetch the profile to renew. */
  profileImageUrl: string | null;
  status: "active" | "blocked" | "pending_verification";
  createdAt: string;
  updatedAt: string;
};

/** Partial update; address parts must be sent together. */
export type UpdateProviderProfilePayload = Partial<{
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: ProviderGender | "";
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}>;

const requireAuthHeaders = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ProviderAuthApiError(
      "Your session expired. Please sign in again.",
    );
  }

  return { Authorization: `Bearer ${accessToken}` };
};

const toApiError = (error: unknown, fallback: string) =>
  new ProviderAuthApiError(
    getApiErrorMessage(error, fallback),
    getApiErrorCode(error) === "VALIDATION_ERROR"
      ? "VALIDATION_ERROR"
      : "UNKNOWN_ERROR",
  );

export const fetchProviderProfile = async (): Promise<ProviderProfile> => {
  const headers = await requireAuthHeaders();

  try {
    const { data } = await httpClient.get<ProviderProfile>(
      PROVIDER_PROFILE_PATH,
      { headers },
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Could not load your profile.");
  }
};

export const updateProviderProfile = async (
  payload: UpdateProviderProfilePayload,
): Promise<ProviderProfile> => {
  const headers = await requireAuthHeaders();

  try {
    const { data } = await httpClient.patch<ProviderProfile>(
      PROVIDER_PROFILE_PATH,
      payload,
      { headers },
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Could not save your personal information.");
  }
};

export const updateProviderProfilePicture = async (
  file: File,
): Promise<ProviderProfile> => {
  const headers = await requireAuthHeaders();
  const formData = new FormData();
  formData.append("profilePicture", file, file.name);

  try {
    const { data } = await httpClient.put<ProviderProfile>(
      `${PROVIDER_PROFILE_PATH}/picture`,
      formData,
      { headers: { ...headers, "Content-Type": undefined } },
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Could not update your profile picture.");
  }
};
