import { getAccessToken } from "../../supabase/session";
import { ClientAuthApiError } from "./errors";

/** `Authorization` header for seeker endpoints; throws when signed out. */
export const requireClientAuthHeaders = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ClientAuthApiError("Your session expired. Please sign in again.");
  }

  return { Authorization: `Bearer ${accessToken}` };
};
