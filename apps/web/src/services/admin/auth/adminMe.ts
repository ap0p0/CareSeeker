import { getApiErrorStatus, httpClient } from "../../../api/httpClient";

/** Path segment for the admin authorization endpoint (appended to `env.apiBaseUrl`). */
export const ADMIN_ME_PATH = "/admin/me" as const;

export type AdminAppUser = {
  id: string;
  role: "seeker" | "provider" | "admin";
  providerVerificationStatus: "pending" | "approved" | "rejected" | null;
};

export type AdminMeResult =
  | { status: "ok"; user: AdminAppUser }
  | { status: "forbidden" }
  | { status: "unauthorized" }
  | { status: "error" };

export const ADMIN_ACCESS_DENIED_MESSAGE =
  "Your account is not authorized to access the admin panel.";

/**
 * Authoritative admin check: GET /admin/me with the Supabase access token.
 *
 * - 200 → allowed (response is the app user; role is admin per backend).
 * - 401 → invalid/expired token (treat as unauthorized; do not trust session alone).
 * - 403 → authenticated but not permitted for admin (wrong role / inactive policy).
 * - Any other status or network failure → treat as unauthorized for gate purposes
 *   (caller should not grant admin UI access).
 */
export async function fetchAdminMe(
  accessToken: string,
): Promise<AdminMeResult> {
  try {
    const { data } = await httpClient.get<AdminAppUser>(ADMIN_ME_PATH, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return { status: "ok", user: data };
  } catch (error) {
    const status = getApiErrorStatus(error);

    if (status === 403) return { status: "forbidden" };
    if (status === 401) return { status: "unauthorized" };
    return { status: "error" };
  }
}
