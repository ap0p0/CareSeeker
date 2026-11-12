import { getApiErrorMessage, httpClient } from "../../api/httpClient";
import { requireClientAuthHeaders } from "./authHeaders";
import { isDemoSession } from "./demoMode";
import { demoOnboardingStatus } from "./demoProfile";
import type { CarePreferences } from "./carePreferences";
import type { CareRecipient } from "./careRecipient";
import { ClientAuthApiError } from "./errors";
import type { SeekerRegistrant } from "./registrant";

export const SEEKER_ONBOARDING_PATH = "/seeker/onboarding" as const;

/**
 * Where the signed-in seeker is in the registration flow, with everything
 * saved so far. Accounts registered for oneself (`careFor: "self"`) carry no
 * on-behalf data and have no review gate.
 */
export type SeekerOnboardingStatus = {
  careFor: "self" | "other";
  registrant: SeekerRegistrant | null;
  careRecipient: CareRecipient | null;
  carePreferences: CarePreferences | null;
  completedAt: string | null;
  profileConfirmedAt: string | null;
};

export const fetchSeekerOnboardingStatus =
  async (): Promise<SeekerOnboardingStatus> => {
    // A demo session is a registered, confirmed account (no API).
    if (isDemoSession()) return demoOnboardingStatus();

    const headers = await requireClientAuthHeaders();

    try {
      const { data } = await httpClient.get<SeekerOnboardingStatus>(
        SEEKER_ONBOARDING_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ClientAuthApiError(
        getApiErrorMessage(error, "Could not load your registration status."),
      );
    }
  };

const post = async (
  action: "complete" | "confirm",
  fallback: string,
): Promise<SeekerOnboardingStatus> => {
  const headers = await requireClientAuthHeaders();

  try {
    const { data } = await httpClient.post<SeekerOnboardingStatus>(
      `${SEEKER_ONBOARDING_PATH}/${action}`,
      undefined,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ClientAuthApiError(getApiErrorMessage(error, fallback));
  }
};

export const completeSeekerOnboarding = () =>
  post("complete", "Could not finish your registration. Please try again.");

export const confirmSeekerProfile = () =>
  post("confirm", "Could not confirm your details. Please try again.");
