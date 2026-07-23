import { getApiErrorStatus, httpClient } from "../../../api/httpClient";

export const SEEKER_ME_PATH = "/seeker/me" as const;

export type ClientAppUser = {
  id: string;
  role: "seeker";
  providerVerificationStatus: "pending" | "approved" | "rejected" | null;
};

export type SeekerMeResult =
  | { status: "ok"; user: ClientAppUser }
  | { status: "forbidden" }
  | { status: "unauthorized" }
  | { status: "error" };

export const SEEKER_ACCESS_DENIED_MESSAGE =
  "Your account is not authorized to access the client dashboard.";

export async function fetchSeekerMe(
  accessToken: string,
): Promise<SeekerMeResult> {
  try {
    const { data } = await httpClient.get<ClientAppUser>(SEEKER_ME_PATH, {
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
