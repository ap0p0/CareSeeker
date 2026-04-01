import { env } from "../../../config/env";

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
  accessToken: string
): Promise<SeekerMeResult> {
  try {
    const res = await fetch(`${env.apiBaseUrl}${SEEKER_ME_PATH}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 200) {
      const user = (await res.json()) as ClientAppUser;
      return { status: "ok", user };
    }

    if (res.status === 403) return { status: "forbidden" };
    if (res.status === 401) return { status: "unauthorized" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
