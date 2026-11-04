import { getApiErrorMessage, httpClient } from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import { ProviderAuthApiError } from "./errors";

export const PROVIDER_ONBOARDING_PATH = "/provider/onboarding" as const;

/** Where the signed-in provider is in the onboarding flow. */
export type ProviderOnboardingStatus = {
  personalInfo: boolean;
  serviceProfile: boolean;
  documentsCount: number;
  workPreferences: boolean;
  completedAt: string | null;
  profileConfirmedAt: string | null;
};

const requireAuthHeaders = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ProviderAuthApiError(
      "Your session expired. Please sign in again.",
    );
  }

  return { Authorization: `Bearer ${accessToken}` };
};

export const fetchProviderOnboardingStatus =
  async (): Promise<ProviderOnboardingStatus> => {
    const headers = await requireAuthHeaders();

    try {
      const { data } = await httpClient.get<ProviderOnboardingStatus>(
        PROVIDER_ONBOARDING_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ProviderAuthApiError(
        getApiErrorMessage(error, "Could not load your onboarding status."),
      );
    }
  };

export const completeProviderOnboarding =
  async (): Promise<ProviderOnboardingStatus> => {
    const headers = await requireAuthHeaders();

    try {
      const { data } = await httpClient.post<ProviderOnboardingStatus>(
        `${PROVIDER_ONBOARDING_PATH}/complete`,
        undefined,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ProviderAuthApiError(
        getApiErrorMessage(
          error,
          "Could not finish your onboarding. Please try again.",
        ),
      );
    }
  };

export const confirmProviderProfile =
  async (): Promise<ProviderOnboardingStatus> => {
    const headers = await requireAuthHeaders();

    try {
      const { data } = await httpClient.post<ProviderOnboardingStatus>(
        `${PROVIDER_ONBOARDING_PATH}/confirm`,
        undefined,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ProviderAuthApiError(
        getApiErrorMessage(
          error,
          "Could not confirm your profile. Please try again.",
        ),
      );
    }
  };
