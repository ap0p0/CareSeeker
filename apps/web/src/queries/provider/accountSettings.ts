import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import { ProviderAuthApiError } from "./errors";

export const PROVIDER_ACCOUNT_SETTINGS_PATH =
  "/provider/account-settings" as const;

/** Sign-in credentials; identity data lives in the profile endpoints. */
export type UpdateProviderAccountSettingsPayload = {
  email?: string;
  password?: string;
};

export const updateProviderAccountSettings = async (
  payload: UpdateProviderAccountSettingsPayload,
): Promise<void> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ProviderAuthApiError(
      "Your session expired. Please sign in again.",
    );
  }

  try {
    await httpClient.patch(PROVIDER_ACCOUNT_SETTINGS_PATH, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw new ProviderAuthApiError(
      getApiErrorMessage(error, "Could not update your account."),
      getApiErrorCode(error) === "VALIDATION_ERROR"
        ? "VALIDATION_ERROR"
        : "UNKNOWN_ERROR",
    );
  }
};
