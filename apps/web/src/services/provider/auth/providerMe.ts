import { getApiErrorStatus, httpClient } from "../../../api/httpClient";

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
  accessToken: string,
): Promise<ProviderMeResult> {
  try {
    const { data } = await httpClient.get<ProviderAppUser>(PROVIDER_ME_PATH, {
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
