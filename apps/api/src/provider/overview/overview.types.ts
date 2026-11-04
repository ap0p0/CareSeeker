import type { ProviderDocumentResponse } from '../documents/documents.types';
import type { ProviderOnboardingStatus } from '../onboarding/onboarding.types';
import type { ProviderProfileResponse } from '../profile/profile.types';
import type { ProviderServiceProfileResponse } from '../service-profile/service-profile.types';
import type { ProviderWorkPreferencesResponse } from '../work-preferences/work-preferences.types';

export type ProfileCompletionSection = {
  key:
    | 'personal_info'
    | 'profile_picture'
    | 'services'
    | 'availability'
    | 'cv'
    | 'supporting_documents';
  label: string;
  /** Points this section contributes to the percentage. */
  weight: number;
  complete: boolean;
};

export type ProfileCompletion = {
  percentage: number;
  sections: ProfileCompletionSection[];
};

/** Everything the provider submitted, in one read for the overview page. */
export type ProviderOverviewResponse = {
  profile: ProviderProfileResponse;
  serviceProfile: ProviderServiceProfileResponse | null;
  workPreferences: ProviderWorkPreferencesResponse | null;
  documents: ProviderDocumentResponse[];
  onboarding: ProviderOnboardingStatus;
  completion: ProfileCompletion;
};
