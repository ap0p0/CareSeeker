/**
 * USPS state / territory codes accepted for addresses (providers, care
 * recipients; US-only platform). Kept in sync with the frontend list in
 * `apps/web/src/utils/usStates.ts`.
 */
export const US_STATE_CODES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const;

export type UsStateCode = (typeof US_STATE_CODES)[number];

const US_STATE_CODE_SET = new Set<string>(US_STATE_CODES);

export function isUsStateCode(value: string): value is UsStateCode {
  return US_STATE_CODE_SET.has(value);
}
