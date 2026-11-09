import type {
  EthnicBackground,
  Gender,
  LivingSituation,
  MobilityLevel,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import type { UsAddress } from '../../common/personal-info.validation';

/**
 * Step 2 of registering on behalf of someone else, after validation: the
 * person receiving care. What they need help with is asked once, in step 3
 * (`care_preferences.careTasks`). Identity + address are stored in `care_recipients`,
 * the care profile in `seekers_info`.
 */
export type CareRecipientInput = UsAddress & {
  name: string;
  surname: string;
  /** UTC midnight. */
  dateOfBirth: Date;
  gender: Gender;
  livingSituation: LivingSituation;
  mobilityLevel: MobilityLevel;
  languagesSpoken: SpokenLanguage[];
  /** Required when `languagesSpoken` includes OTHER, otherwise null. */
  otherLanguage: string | null;
  ethnicBackground: EthnicBackground;
  additionalInfo: string | null;
};

/** Care recipient as returned to the frontend (enum values lower-cased). */
export type CareRecipientResponse = UsAddress & {
  name: string;
  surname: string;
  /** `YYYY-MM-DD` */
  dateOfBirth: string;
  gender: string;
  livingSituation: string | null;
  mobilityLevel: string | null;
  languagesSpoken: string[];
  otherLanguage: string | null;
  ethnicBackground: string | null;
  additionalInfo: string | null;
  updatedAt: Date;
};

/** `GET /seeker/care-recipient` — `completed` once step 2 was saved. */
export type CareRecipientStatusResponse = {
  completed: boolean;
  careRecipient: CareRecipientResponse | null;
};
