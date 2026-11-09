import type { Gender } from '../../../generated/prisma/client.js';

/** US-only: `state` is the USPS code, `postalCode` the ZIP. */
export type ProviderProfileAddress = {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
};

/**
 * Partial update of provider personal information (onboarding step 1 fields).
 * Only keys present in the request body are applied. Address parts are
 * validated together whenever any of them is sent.
 */
export type UpdateProviderProfilePayload = {
  name?: string;
  surname?: string;
  dateOfBirth?: Date;
  gender?: Gender | null;
  phone?: string;
  address?: ProviderProfileAddress;
};

export type ProviderProfileResponse = {
  id: string;
  userId: string;
  name: string;
  surname: string;
  email: string;
  /** `YYYY-MM-DD`, null until step 1 has been completed. */
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: ProviderProfileAddress | null;
  /** Short-lived signed URL for the private profile picture, if any. */
  profileImageUrl: string | null;
  status: 'active' | 'blocked' | 'pending_verification';
  createdAt: Date;
  updatedAt: Date;
};
