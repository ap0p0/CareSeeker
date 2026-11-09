import type { RegistrantRelationship } from '../../../generated/prisma/client.js';

/**
 * Step 1 of registering on behalf of someone else, after validation /
 * normalization: the registrant (account holder) and their credentials.
 * `name`, `surname` and `email` are stored on `users`; the rest on
 * `registrants_info`.
 */
export type RegisterSeekerOnBehalfPayload = {
  name: string;
  surname: string;
  email: string;
  password: string;
  /** E.164 US number (`+1XXXXXXXXXX`). */
  phone: string;
  relationship: RegistrantRelationship;
  /** Free text, only when `relationship` is `OTHER`. */
  relationshipOther: string | null;
  /** Always `true` once validated; kept so the intent is explicit. */
  consentToActOnBehalf: true;
};

/** Editable registrant details (`PUT /seeker/registrant`). */
export type UpdateRegistrantPayload = {
  name: string;
  surname: string;
  phone: string;
  relationship: RegistrantRelationship;
  relationshipOther: string | null;
};

/** Registrant-specific details as returned after registration. */
export type RegistrantInfoResponse = {
  phone: string;
  relationship: string;
  relationshipOther: string | null;
  consentConfirmedAt: Date;
};

/** Shape returned after a successful on-behalf registration. */
export type RegisterSeekerOnBehalfResponse = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  careFor: 'other';
  registrant: RegistrantInfoResponse;
};

/**
 * `GET` / `PUT /seeker/registrant`: the account holder's identity (from
 * `users`) together with their registrant details, enum values lower-cased.
 */
export type RegistrantResponse = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  relationship: string;
  relationshipOther: string | null;
  consentConfirmedAt: Date;
  updatedAt: Date;
};
