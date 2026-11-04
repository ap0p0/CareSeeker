/** Progress through the provider onboarding flow, derived from stored data. */
export type ProviderOnboardingStatus = {
  /** Step 1 saved (`providers_info` row exists). */
  personalInfo: boolean;
  /** Step 2 saved (`provider_service_profiles` row exists). */
  serviceProfile: boolean;
  /** Active documents uploaded in step 3 (optional step). */
  documentsCount: number;
  /** Step 4 saved (`provider_work_preferences` row exists). */
  workPreferences: boolean;
  /** Set once the provider finished the flow; `/register` then redirects. */
  completedAt: Date | null;
  /** Set once the provider confirmed the overview; dashboard becomes home. */
  profileConfirmedAt: Date | null;
};
