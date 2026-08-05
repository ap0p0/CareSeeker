export type CareForChoice = "self" | "other";

export type RegisterStep =
  | "care-for"
  | "seeker-create-account"
  | "seeker-about-you"
  | "seeker-medical-history"
  | "seeker-setup-complete"
  | "recipient-personal-info";

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
