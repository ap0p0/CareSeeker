import dayjs, { type Dayjs } from "dayjs";
import type {
  CareRecipient,
  CareRecipientPayload,
  MobilityLevel,
  RegistrantRelationship,
  SeekerRegistrant,
  UpdateSeekerRegistrantPayload,
} from "../../../../queries/client";
import type { Gender } from "../../../../utils/gender";
import type { UsAddressForm } from "../../../../utils/usAddress";
import { DATE_OF_BIRTH_FORMAT } from "../../../../utils/dateOfBirth";
import { formatUsPhone, normalizeUsPhone } from "../../../../utils/usPhone";

export type CareForChoice = "self" | "other";

export type RegisterStep =
  | "care-for"
  | "seeker-create-account"
  | "seeker-about-you"
  | "seeker-medical-history"
  | "seeker-setup-complete"
  | "registrant-info"
  | "recipient-personal-info"
  | "care-needs";

/**
 * Steps of the "care for someone else" registration, in order. Step 1
 * (the registrant — the person opening the account) creates the account;
 * the following steps run signed in and describe the care recipient. Users
 * can move back and forth: once the account exists, step 1 is edited in
 * place (`PUT /seeker/registrant`) and every later step is re-saved on
 * continue.
 */
export type OnBehalfRegisterStep = Extract<
  RegisterStep,
  "registrant-info" | "recipient-personal-info" | "care-needs"
>;

export const ON_BEHALF_REGISTER_STEPS: {
  key: OnBehalfRegisterStep;
  label: string;
}[] = [
  { key: "registrant-info", label: "About you" },
  { key: "recipient-personal-info", label: "Who needs care" },
  { key: "care-needs", label: "Care needs" },
];

export const isOnBehalfRegisterStep = (
  step: RegisterStep,
): step is OnBehalfRegisterStep =>
  ON_BEHALF_REGISTER_STEPS.some((entry) => entry.key === step);

export type YesNo = "yes" | "no";

export type OptionalDisclose = "share" | "prefer_not_to_say";

export type EthnicBackground =
  | "caucasian"
  | "african_american"
  | "latino"
  | "asian"
  | "native_american"
  | "middle_eastern"
  | "multiracial_other"
  | "prefer_not_to_say";

export type SpokenLanguage =
  | "english"
  | "spanish"
  | "chinese"
  | "vietnamese"
  | "arabic"
  | "french"
  | "korean"
  | "russian"
  | "portuguese"
  | "hindi"
  | "other";

export type LivingSituation =
  | "live_alone"
  | "with_spouse_partner"
  | "with_family"
  | "with_roommates"
  | "assisted_living"
  | "other";

export type PreferredCaregiverGender = "female" | "male" | "no_preference";

export type ScheduleVibe = "daytime" | "evenings" | "overnight" | "flexible";

export type HomeAccessibility = "stairs" | "elevator" | "parking";

export type CareUrgency = "asap" | "within_a_week" | "exploring";

export type BasicCareNeed =
  | "cleaning"
  | "cooking"
  | "hygiene"
  | "companionship"
  | "errands"
  | "laundry"
  | "mobility_support"
  | "transportation"
  | "other";

export type SeekerCreateAccountForm = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/** Step 1 of registering on behalf of someone else: the registrant. */
export type RegistrantInfoForm = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  relationship: RegistrantRelationship | "";
  /** Free text, only when `relationship` is `other`. */
  relationshipOther: string;
  password: string;
  confirmPassword: string;
  consentToActOnBehalf: boolean;
};

export type RegistrantInfoField = keyof RegistrantInfoForm;

export type RegistrantInfoErrors = Partial<Record<RegistrantInfoField, string>>;

/**
 * On-behalf step 2: the person receiving care. Identity + address are stored
 * in `care_recipients`; the care profile in `seekers_info`. What they need
 * help with is asked once, in step 3.
 */
export type CareRecipientForm = UsAddressForm & {
  name: string;
  surname: string;
  /** Date picker value; `null` until chosen, may be invalid while typing. */
  dateOfBirth: Dayjs | null;
  gender: Gender | "";
  livingSituation: LivingSituation | "";
  mobilityLevel: MobilityLevel | "";
  languagesSpoken: SpokenLanguage[];
  otherLanguage: string;
  ethnicBackground: EthnicBackground | "";
  additionalInfo: string;
};

export type CareRecipientField = keyof CareRecipientForm;

export type CareRecipientErrors = Partial<Record<CareRecipientField, string>>;

export type SeekerAboutYouForm = {
  age: string;
  ethnicBackground: EthnicBackground | "";
  location: string;
  languagesSpoken: SpokenLanguage[];
  livingSituation: LivingSituation | "";
  needsHelpBesidesHousehold: YesNo | "";
  preferredCaregiverGender: PreferredCaregiverGender | "";
  preferredCaregiverLanguage: SpokenLanguage | "";
  culturalConsiderationsChoice: OptionalDisclose | "";
  culturalConsiderationsNotes: string;
  scheduleVibe: ScheduleVibe | "";
  homeAccessibility: HomeAccessibility[];
  careUrgency: CareUrgency | "";
};

export type SeekerMedicalHistory = {
  needsMedicalHelp: YesNo | "";
  healthNotesChoice: OptionalDisclose | "";
  healthNotes: string;
  medicationsChoice: OptionalDisclose | "";
  medicationsNotes: string;
  basicCareNeeds: BasicCareNeed[];
  otherCareNeedDetails: string;
};

/** Read from the registrant's side: "Child" = "I am their child". */
export const REGISTRANT_RELATIONSHIP_OPTIONS: {
  value: RegistrantRelationship;
  label: string;
}[] = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child (son / daughter)" },
  { value: "spouse_partner", label: "Spouse / partner" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "other_relative", label: "Other relative" },
  { value: "friend_neighbor", label: "Friend / neighbor" },
  { value: "legal_guardian", label: "Legal guardian" },
  { value: "other", label: "Other" },
];

export const MOBILITY_LEVEL_OPTIONS: {
  value: MobilityLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "independent",
    label: "Fully independent",
    description: "Moves around without help.",
  },
  {
    value: "walking_aid",
    label: "Uses a walking aid",
    description: "Walks with a cane, walker or similar.",
  },
  {
    value: "needs_assistance",
    label: "Needs help moving",
    description: "Needs a hand to walk, stand up or get in and out of bed.",
  },
  {
    value: "wheelchair",
    label: "Uses a wheelchair",
    description: "Uses a wheelchair most of the time.",
  },
  {
    value: "bedbound",
    label: "Mostly in bed",
    description: "Spends most of the day in bed.",
  },
];

export const ETHNIC_BACKGROUND_OPTIONS: {
  value: EthnicBackground;
  label: string;
}[] = [
  { value: "caucasian", label: "Caucasian" },
  { value: "african_american", label: "African American" },
  { value: "latino", label: "Latino" },
  { value: "asian", label: "Asian" },
  { value: "native_american", label: "Native American" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "multiracial_other", label: "Multiracial / Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const SPOKEN_LANGUAGE_OPTIONS: {
  value: SpokenLanguage;
  label: string;
}[] = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "chinese", label: "Chinese" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "arabic", label: "Arabic" },
  { value: "french", label: "French" },
  { value: "korean", label: "Korean" },
  { value: "russian", label: "Russian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "hindi", label: "Hindi" },
  { value: "other", label: "Other" },
];

export const LIVING_SITUATION_OPTIONS: {
  value: LivingSituation;
  label: string;
}[] = [
  { value: "live_alone", label: "Live alone" },
  { value: "with_spouse_partner", label: "With spouse / partner" },
  { value: "with_family", label: "With family" },
  { value: "with_roommates", label: "With roommates" },
  { value: "assisted_living", label: "Assisted living" },
  { value: "other", label: "Other" },
];

export const PREFERRED_CAREGIVER_GENDER_OPTIONS: {
  value: PreferredCaregiverGender;
  label: string;
}[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "no_preference", label: "No preference" },
];

export const SCHEDULE_VIBE_OPTIONS: {
  value: ScheduleVibe;
  label: string;
}[] = [
  { value: "daytime", label: "Mostly daytime" },
  { value: "evenings", label: "Evenings" },
  { value: "overnight", label: "Overnight" },
  { value: "flexible", label: "Flexible" },
];

export const HOME_ACCESSIBILITY_OPTIONS: {
  value: HomeAccessibility;
  label: string;
}[] = [
  { value: "stairs", label: "Stairs" },
  { value: "elevator", label: "Elevator" },
  { value: "parking", label: "Parking" },
];

export const CARE_URGENCY_OPTIONS: {
  value: CareUrgency;
  label: string;
}[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "within_a_week", label: "Within a week" },
  { value: "exploring", label: "Just exploring" },
];

export const BASIC_CARE_NEED_OPTIONS: {
  value: BasicCareNeed;
  label: string;
}[] = [
  { value: "cleaning", label: "Cleaning" },
  { value: "cooking", label: "Cooking" },
  { value: "hygiene", label: "Hygiene" },
  { value: "companionship", label: "Companionship" },
  { value: "errands", label: "Errands" },
  { value: "laundry", label: "Laundry" },
  { value: "mobility_support", label: "Mobility support" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

export const EMPTY_SEEKER_CREATE_ACCOUNT: SeekerCreateAccountForm = {
  name: "",
  surname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const EMPTY_REGISTRANT_INFO: RegistrantInfoForm = {
  name: "",
  surname: "",
  email: "",
  phone: "",
  relationship: "",
  relationshipOther: "",
  password: "",
  confirmPassword: "",
  consentToActOnBehalf: false,
};

export const EMPTY_CARE_RECIPIENT: CareRecipientForm = {
  name: "",
  surname: "",
  dateOfBirth: null,
  gender: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  livingSituation: "",
  mobilityLevel: "",
  languagesSpoken: [],
  otherLanguage: "",
  ethnicBackground: "",
  additionalInfo: "",
};

/** Saved step 1 → form (resuming / going back after the account exists). */
export const registrantFormFromSaved = (
  registrant: SeekerRegistrant,
): RegistrantInfoForm => ({
  ...EMPTY_REGISTRANT_INFO,
  name: registrant.name,
  surname: registrant.surname,
  email: registrant.email,
  phone: formatUsPhone(registrant.phone),
  relationship: registrant.relationship,
  relationshipOther: registrant.relationshipOther ?? "",
  // Given at registration; the edit form does not ask again.
  consentToActOnBehalf: true,
});

/** Saved step 2 → form. Values the API returns are valid option values. */
export const careRecipientFormFromSaved = (
  recipient: CareRecipient,
): CareRecipientForm => ({
  name: recipient.name,
  surname: recipient.surname,
  dateOfBirth: dayjs(recipient.dateOfBirth),
  gender: recipient.gender,
  addressLine1: recipient.addressLine1,
  city: recipient.city,
  state: recipient.state,
  postalCode: recipient.postalCode,
  livingSituation: (recipient.livingSituation ?? "") as LivingSituation | "",
  mobilityLevel: recipient.mobilityLevel ?? "",
  languagesSpoken: recipient.languagesSpoken as SpokenLanguage[],
  otherLanguage: recipient.otherLanguage ?? "",
  ethnicBackground: (recipient.ethnicBackground ?? "") as EthnicBackground | "",
  additionalInfo: recipient.additionalInfo ?? "",
});

export const EMPTY_SEEKER_ABOUT_YOU: SeekerAboutYouForm = {
  age: "",
  ethnicBackground: "",
  location: "",
  languagesSpoken: [],
  livingSituation: "",
  needsHelpBesidesHousehold: "",
  preferredCaregiverGender: "",
  preferredCaregiverLanguage: "",
  culturalConsiderationsChoice: "",
  culturalConsiderationsNotes: "",
  scheduleVibe: "",
  homeAccessibility: [],
  careUrgency: "",
};

export const EMPTY_SEEKER_MEDICAL_HISTORY: SeekerMedicalHistory = {
  needsMedicalHelp: "",
  healthNotesChoice: "",
  healthNotes: "",
  medicationsChoice: "",
  medicationsNotes: "",
  basicCareNeeds: [],
  otherCareNeedDetails: "",
};

/** Editable step 1 fields, sent when the account already exists. */
export const toRegistrantUpdatePayload = (
  form: RegistrantInfoForm,
): UpdateSeekerRegistrantPayload => ({
  // Validated by the step before submitting; the API enforces it all again.
  name: form.name.trim(),
  surname: form.surname.trim(),
  phone: normalizeUsPhone(form.phone) ?? form.phone,
  relationship: form.relationship || "other",
  ...(form.relationship === "other"
    ? { relationshipOther: form.relationshipOther.trim() }
    : {}),
});

export const toCareRecipientPayload = (
  form: CareRecipientForm,
): CareRecipientPayload => ({
  // Validated by the step before submitting; the API enforces it all again.
  name: form.name.trim(),
  surname: form.surname.trim(),
  dateOfBirth: form.dateOfBirth?.format(DATE_OF_BIRTH_FORMAT) ?? "",
  gender: form.gender || "prefer_not_to_say",
  addressLine1: form.addressLine1.trim(),
  city: form.city.trim(),
  state: form.state,
  postalCode: form.postalCode.trim(),
  livingSituation: form.livingSituation,
  mobilityLevel: form.mobilityLevel || "independent",
  languagesSpoken: form.languagesSpoken,
  ...(form.languagesSpoken.includes("other")
    ? { otherLanguage: form.otherLanguage.trim() }
    : {}),
  ethnicBackground: form.ethnicBackground,
  additionalInfo: form.additionalInfo.trim() || null,
});
