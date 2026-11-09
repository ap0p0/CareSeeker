import { getApiErrorMessage, httpClient } from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import { ProviderAuthApiError } from "./errors";

export const PROVIDER_SERVICE_PROFILE_PATH =
  "/provider/service-profile" as const;

/**
 * Onboarding step 2 payload — every multi-select is an array of lower-cased
 * option values (see `utils/careOptions.ts`).
 */
export type ProviderServiceProfilePayload = {
  careServices: string[];
  otherCareService: string;
  skills: string[];
  otherSkill: string;
  yearsOfExperience: number;
  previousCareExperience: string;
  qualifications: string[];
  otherQualification: string;
  languages: string[];
  otherLanguage: string;
  coverLetter: string;
  jobCategories: string[];
  tasksWilling: string[];
  tasksUnwilling: string[];
  clientGroups: string[];
};

export type ProviderServiceProfile = Omit<
  ProviderServiceProfilePayload,
  "otherCareService" | "otherSkill" | "otherQualification" | "otherLanguage"
> & {
  otherCareService: string | null;
  otherSkill: string | null;
  otherQualification: string | null;
  otherLanguage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProviderServiceProfileEnvelope = {
  /** `false` until step 2 has been saved at least once. */
  completed: boolean;
  profile: ProviderServiceProfile | null;
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

export const fetchProviderServiceProfile =
  async (): Promise<ProviderServiceProfileEnvelope> => {
    const headers = await requireAuthHeaders();

    try {
      const { data } = await httpClient.get<ProviderServiceProfileEnvelope>(
        PROVIDER_SERVICE_PROFILE_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      throw new ProviderAuthApiError(
        getApiErrorMessage(error, "Could not load your services profile."),
      );
    }
  };

export const saveProviderServiceProfile = async (
  payload: ProviderServiceProfilePayload,
): Promise<ProviderServiceProfileEnvelope> => {
  const headers = await requireAuthHeaders();

  try {
    const { data } = await httpClient.put<ProviderServiceProfileEnvelope>(
      PROVIDER_SERVICE_PROFILE_PATH,
      payload,
      { headers },
    );
    return data;
  } catch (error) {
    throw new ProviderAuthApiError(
      getApiErrorMessage(
        error,
        "Could not save your services and job interests. Please try again.",
      ),
      "VALIDATION_ERROR",
    );
  }
};
