import type {
  CareServiceCategory,
  CareSkill,
  CareTask,
  ClientGroup,
  ProfessionalQualification,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';

/** Validated / normalized onboarding step 2 payload (enum values upper-cased). */
export type ProviderServiceProfileInput = {
  careServices: CareServiceCategory[];
  otherCareService: string | null;
  skills: CareSkill[];
  otherSkill: string | null;
  yearsOfExperience: number;
  previousCareExperience: string;
  qualifications: ProfessionalQualification[];
  otherQualification: string | null;
  languages: SpokenLanguage[];
  otherLanguage: string | null;
  coverLetter: string;
  jobCategories: CareServiceCategory[];
  tasksWilling: CareTask[];
  tasksUnwilling: CareTask[];
  clientGroups: ClientGroup[];
};

/** API representation (enum values lower-cased like the rest of the API). */
export type ProviderServiceProfileResponse = {
  careServices: string[];
  otherCareService: string | null;
  skills: string[];
  otherSkill: string | null;
  yearsOfExperience: number;
  previousCareExperience: string;
  qualifications: string[];
  otherQualification: string | null;
  languages: string[];
  otherLanguage: string | null;
  coverLetter: string;
  jobCategories: string[];
  tasksWilling: string[];
  tasksUnwilling: string[];
  clientGroups: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProviderServiceProfileEnvelope = {
  /** `false` until the provider has saved step 2 at least once. */
  completed: boolean;
  profile: ProviderServiceProfileResponse | null;
};
