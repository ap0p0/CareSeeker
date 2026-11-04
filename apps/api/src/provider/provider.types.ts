import type { ProviderGender } from '../../generated/prisma/client.js';
import type { ProviderAddress } from './common/personal-info.validation';

/**
 * Personal information collected in provider onboarding step 1, after
 * validation / normalization. `name`, `surname` and `email` are stored on
 * `users`; the rest on `providers_info`.
 */
export type ProviderPersonalInfo = ProviderAddress & {
  name: string;
  surname: string;
  dateOfBirth: Date;
  gender: ProviderGender | null;
  phone: string;
};

export type RegisterProviderPayload = ProviderPersonalInfo & {
  email: string;
  password: string;
};

/** Shape returned to the frontend after a successful registration. */
export type RegisterProviderResponse = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  providerVerificationStatus: string | null;
};
