import { env } from "../../../config/env";

export const PROVIDER_ME_PATH = "/provider/me" as const;

export type ProviderAppUser = {
  id: string;
  role: "provider";
  providerVerificationStatus: "pending" | "approved" | "rejected" | null;
};

export type ProviderMeResult =
  | { status: "ok"; user: ProviderAppUser }
  | { status: "forbidden" }
  | { status: "unauthorized" }
  | { status: "error" };

export const PROVIDER_ACCESS_DENIED_MESSAGE =
  "Your account is not authorized to access the provider dashboard.";

export async function fetchProviderMe(
  accessToken: string
): Promise<ProviderMeResult> {
  try {
    const res = await fetch(`${env.apiBaseUrl}${PROVIDER_ME_PATH}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 200) {
      const user = (await res.json()) as ProviderAppUser;
      return { status: "ok", user };
    }

    if (res.status === 403) return { status: "forbidden" };
    if (res.status === 401) return { status: "unauthorized" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
