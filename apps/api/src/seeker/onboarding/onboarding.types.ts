import type { CarePreferencesResponse } from '../care-preferences/care-preferences.types';
import type { CareRecipientResponse } from '../care-recipient/care-recipient.types';
import type { RegistrantResponse } from '../registrant/registrant.types';

/**
 * Where the signed-in seeker is in the registration flow, with everything
 * saved so far — enough for the review page and for the route guard in one
 * request. Accounts registered for oneself (`careFor: "self"`) have no
 * on-behalf data and no completion gate.
 */
export type SeekerOnboardingStatus = {
  careFor: 'self' | 'other';
  registrant: RegistrantResponse | null;
  careRecipient: CareRecipientResponse | null;
  carePreferences: CarePreferencesResponse | null;
  completedAt: Date | null;
  profileConfirmedAt: Date | null;
};
