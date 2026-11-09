import type { Gender } from '../../../generated/prisma/client.js';
import {
  parseDateOfBirth as parseDateOfBirthWithRules,
  parseGender as parseGenderWithOptions,
  type UsAddress,
} from '../../common/personal-info.validation';
import { normalizeUsPhone, parseUsPhone } from '../../common/us-phone';

/**
 * Field-level parsers for provider personal information (onboarding step 1).
 *
 * The generic rules (names, dates of birth, genders, US addresses, phones)
 * live in `src/common/` and are shared with the seeker flows; this module
 * pins the provider-specific parts (providers must be 18+, gender is
 * optional). Used by registration and by the authenticated profile update so
 * both paths enforce identical rules.
 */

export const MIN_PROVIDER_AGE = 18;
export const MAX_PROVIDER_AGE = 120;

/** US-only address: `state` is the USPS code, `postalCode` the ZIP. */
export type ProviderAddress = UsAddress;

export {
  calculateAge,
  hasOwn,
  parseAddress,
  parseName,
} from '../../common/personal-info.validation';
export { normalizeUsPhone };

/**
 * Accepts `YYYY-MM-DD`, returns a UTC midnight `Date`. Providers must be at
 * least 18 years old.
 */
export function parseDateOfBirth(
  value: unknown,
  errors: string[],
  today = new Date(),
): Date | null {
  return parseDateOfBirthWithRules(
    value,
    errors,
    { minAge: MIN_PROVIDER_AGE, maxAge: MAX_PROVIDER_AGE },
    today,
  );
}

/** Optional. Empty / null clears the value; otherwise must match `Gender`. */
export function parseGender(value: unknown, errors: string[]): Gender | null {
  return parseGenderWithOptions(value, errors, { required: false });
}

export function parsePhone(value: unknown, errors: string[]): string | null {
  return parseUsPhone(value, errors, 'phone');
}
