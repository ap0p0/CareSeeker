/**
 * Option catalogues for onboarding step 2 (services & job interests). Values
 * are the lower-cased API enum names (`apps/api/prisma/schema.prisma`).
 */
export type Option<T extends string> = { value: T; label: string };

export type CareServiceCategory =
  | "elderly_care"
  | "child_care"
  | "disability_assistance"
  | "personal_care"
  | "companionship"
  | "household_assistance"
  | "medical_nursing"
  | "other";

export const CARE_SERVICE_OPTIONS: Option<CareServiceCategory>[] = [
  { value: "elderly_care", label: "Elderly care" },
  { value: "child_care", label: "Child care" },
  { value: "disability_assistance", label: "Disability assistance" },
  { value: "personal_care", label: "Personal care" },
  { value: "companionship", label: "Companionship" },
  { value: "household_assistance", label: "Household assistance" },
  { value: "medical_nursing", label: "Medical / nursing" },
  { value: "other", label: "Other (specify)" },
];

/** Same vocabulary as services, without "Other" (no free text on this side). */
export const JOB_CATEGORY_OPTIONS: Option<CareServiceCategory>[] =
  CARE_SERVICE_OPTIONS.filter((option) => option.value !== "other");

export type CareSkill =
  | "first_aid_cpr"
  | "medication_management"
  | "mobility_transfer_assistance"
  | "dementia_alzheimers_care"
  | "meal_preparation"
  | "housekeeping"
  | "personal_hygiene_assistance"
  | "transportation"
  | "companionship_emotional_support"
  | "child_development"
  | "special_needs_support"
  | "palliative_hospice_care"
  | "other";

export const CARE_SKILL_OPTIONS: Option<CareSkill>[] = [
  { value: "first_aid_cpr", label: "First aid / CPR" },
  { value: "medication_management", label: "Medication management" },
  {
    value: "mobility_transfer_assistance",
    label: "Mobility & transfer assistance",
  },
  { value: "dementia_alzheimers_care", label: "Dementia / Alzheimer’s care" },
  { value: "meal_preparation", label: "Meal preparation" },
  { value: "housekeeping", label: "Housekeeping" },
  {
    value: "personal_hygiene_assistance",
    label: "Personal hygiene assistance",
  },
  { value: "transportation", label: "Transportation" },
  {
    value: "companionship_emotional_support",
    label: "Companionship & emotional support",
  },
  { value: "child_development", label: "Child development" },
  { value: "special_needs_support", label: "Special needs support" },
  { value: "palliative_hospice_care", label: "Palliative / hospice care" },
  { value: "other", label: "Other (specify)" },
];

export type ProfessionalQualification =
  | "cna"
  | "hha"
  | "rn"
  | "lpn_lvn"
  | "cpr_first_aid_certification"
  | "caregiver_certification"
  | "early_childhood_education"
  | "social_work"
  | "nursing_degree"
  | "other";

export const QUALIFICATION_OPTIONS: Option<ProfessionalQualification>[] = [
  { value: "cna", label: "Certified Nursing Assistant (CNA)" },
  { value: "hha", label: "Home Health Aide (HHA)" },
  { value: "rn", label: "Registered Nurse (RN)" },
  {
    value: "lpn_lvn",
    label: "Licensed Practical / Vocational Nurse (LPN/LVN)",
  },
  {
    value: "cpr_first_aid_certification",
    label: "CPR / First aid certification",
  },
  { value: "caregiver_certification", label: "Caregiver certification" },
  { value: "early_childhood_education", label: "Early childhood education" },
  { value: "social_work", label: "Social work" },
  { value: "nursing_degree", label: "Nursing degree" },
  { value: "other", label: "Other (specify)" },
];

/** Most spoken languages in the US; shared with the seeker side for matching. */
export type SpokenLanguage =
  | "english"
  | "spanish"
  | "chinese"
  | "tagalog"
  | "vietnamese"
  | "arabic"
  | "french"
  | "korean"
  | "russian"
  | "portuguese"
  | "hindi"
  | "other";

export const LANGUAGE_OPTIONS: Option<SpokenLanguage>[] = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "chinese", label: "Chinese (Mandarin / Cantonese)" },
  { value: "tagalog", label: "Tagalog" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "arabic", label: "Arabic" },
  { value: "french", label: "French" },
  { value: "korean", label: "Korean" },
  { value: "russian", label: "Russian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "hindi", label: "Hindi" },
  { value: "other", label: "Other (specify)" },
];

export type CareTask =
  | "bathing_hygiene"
  | "toileting_incontinence_care"
  | "dressing_grooming"
  | "feeding_assistance"
  | "meal_preparation"
  | "medication_reminders"
  | "mobility_transfers"
  | "heavy_lifting"
  | "light_housekeeping"
  | "laundry"
  | "shopping_errands"
  | "transportation_driving"
  | "companionship"
  | "overnight_care"
  | "pet_care";

export const CARE_TASK_OPTIONS: Option<CareTask>[] = [
  { value: "bathing_hygiene", label: "Bathing & personal hygiene" },
  {
    value: "toileting_incontinence_care",
    label: "Toileting & incontinence care",
  },
  { value: "dressing_grooming", label: "Dressing & grooming" },
  { value: "feeding_assistance", label: "Feeding assistance" },
  { value: "meal_preparation", label: "Meal preparation" },
  { value: "medication_reminders", label: "Medication reminders" },
  { value: "mobility_transfers", label: "Mobility & transfers" },
  { value: "heavy_lifting", label: "Heavy lifting" },
  { value: "light_housekeeping", label: "Light housekeeping" },
  { value: "laundry", label: "Laundry" },
  { value: "shopping_errands", label: "Shopping & errands" },
  { value: "transportation_driving", label: "Transportation / driving" },
  { value: "companionship", label: "Companionship" },
  { value: "overnight_care", label: "Overnight care" },
  { value: "pet_care", label: "Pet care" },
];

export type ClientGroup =
  | "seniors"
  | "adults_with_disabilities"
  | "children"
  | "infants_toddlers"
  | "people_with_dementia"
  | "post_surgery_recovery"
  | "chronic_illness"
  | "hospice_palliative"
  | "mental_health"
  | "veterans";

export const CLIENT_GROUP_OPTIONS: Option<ClientGroup>[] = [
  { value: "seniors", label: "Seniors" },
  { value: "adults_with_disabilities", label: "Adults with disabilities" },
  { value: "children", label: "Children" },
  { value: "infants_toddlers", label: "Infants & toddlers" },
  { value: "people_with_dementia", label: "People with dementia" },
  { value: "post_surgery_recovery", label: "Post-surgery / recovery" },
  { value: "chronic_illness", label: "Chronic illness" },
  { value: "hospice_palliative", label: "Hospice / palliative" },
  { value: "mental_health", label: "Mental health" },
  { value: "veterans", label: "Veterans" },
];
