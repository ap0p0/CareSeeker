import { isUsStateCode } from "./usStates";

/** US-only structured address, as sent to the API. */
export type UsAddressForm = {
  addressLine1: string;
  city: string;
  /** USPS state code, e.g. `TX`. */
  state: string;
  /** ZIP or ZIP+4. */
  postalCode: string;
};

export type UsAddressField = keyof UsAddressForm;

/** US ZIP or ZIP+4. */
export const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

/**
 * One message per invalid address part; mirrors the API `parseAddress`.
 * `whose` personalizes the copy ("your" street address, "their" city…).
 */
export const validateUsAddress = (
  address: UsAddressForm,
  whose: "your" | "their" = "your",
): Partial<Record<UsAddressField, string>> => {
  const errors: Partial<Record<UsAddressField, string>> = {};

  if (!address.addressLine1.trim()) {
    errors.addressLine1 = `Please enter ${whose} street address.`;
  }

  if (!address.city.trim()) {
    errors.city = `Please enter ${whose} city.`;
  }

  if (!address.state) {
    errors.state = `Please select ${whose} state.`;
  } else if (!isUsStateCode(address.state)) {
    errors.state = "Please select a valid state.";
  }

  if (!address.postalCode.trim()) {
    errors.postalCode = `Please enter ${whose} ZIP code.`;
  } else if (!US_ZIP_REGEX.test(address.postalCode.trim())) {
    errors.postalCode = "Please enter a valid ZIP code (12345 or 12345-6789).";
  }

  return errors;
};
