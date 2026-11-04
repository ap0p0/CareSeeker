import { getApiErrorMessage, httpClient } from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import type { ProviderDocument } from "./documents";
import { ProviderAuthApiError } from "./errors";
import type { ProviderOnboardingStatus } from "./onboarding";
import type { ProviderProfile } from "./profile";
import type { ProviderServiceProfile } from "./serviceProfile";
import type { ProviderWorkPreferences } from "./workPreferences";

export const PROVIDER_OVERVIEW_PATH = "/provider/overview" as const;

export type ProfileCompletionSection = {
  key:
    | "personal_info"
    | "profile_picture"
    | "services"
    | "availability"
    | "cv"
    | "supporting_documents";
  label: string;
  weight: number;
  complete: boolean;
};

export type ProfileCompletion = {
  percentage: number;
  sections: ProfileCompletionSection[];
};

/** Everything the provider submitted, in one read. */
export type ProviderOverview = {
  profile: ProviderProfile;
  serviceProfile: ProviderServiceProfile | null;
  workPreferences: ProviderWorkPreferences | null;
  documents: ProviderDocument[];
  onboarding: ProviderOnboardingStatus;
  completion: ProfileCompletion;
};

export const fetchProviderOverview = async (): Promise<ProviderOverview> => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ProviderAuthApiError(
      "Your session expired. Please sign in again.",
    );
  }

  try {
    const { data } = await httpClient.get<ProviderOverview>(
      PROVIDER_OVERVIEW_PATH,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return data;
  } catch (error) {
    throw new ProviderAuthApiError(
      getApiErrorMessage(error, "Could not load your profile overview."),
    );
  }
};
