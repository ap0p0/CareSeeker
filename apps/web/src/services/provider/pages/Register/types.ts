import dayjs, { type Dayjs } from "dayjs";
import type {
  AvailabilityStart,
  DayAvailabilityMode,
  ProviderGender,
  ProviderProfile,
  ProviderServiceProfile,
  ProviderWorkPreferences,
  VehicleType,
  WorkType,
} from "../../../../queries/provider";
import { TIME_FORMAT } from "./workPreferenceOptions";
import type {
  CareServiceCategory,
  CareSkill,
  CareTask,
  ClientGroup,
  ProfessionalQualification,
  SpokenLanguage,
} from "./serviceOptions";

/**
 * Provider onboarding steps, in order. Steps 1 and 2 are filled in locally
 * (back / continue keep the data); the account is created when step 2 is
 * submitted and step 2 is saved with the new session. Step 3 (documents)
 * runs signed in: files are uploaded as they are added and persist on the
 * server, so going back and forth keeps them.
 */
export type ProviderRegisterStep =
  | "personal-info"
  | "services-jobs"
  | "documents"
  | "availability";

export const PROVIDER_REGISTER_STEPS: {
  key: ProviderRegisterStep;
  label: string;
}[] = [
  { key: "personal-info", label: "Personal information" },
  { key: "services-jobs", label: "Services & job interests" },
  { key: "documents", label: "Documents" },
  { key: "availability", label: "Availability & preferences" },
];

export type ProviderPersonalInfoForm = {
  name: string;
  surname: string;
  /** Date picker value; `null` until chosen, may be an invalid Dayjs while typing. */
  dateOfBirth: Dayjs | null;
  gender: ProviderGender | "";
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  addressLine1: string;
  city: string;
  /** USPS state code, e.g. `TX`. */
  state: string;
  /** ZIP or ZIP+4. */
  postalCode: string;
  profilePicture: File | null;
};

export type ProviderPersonalInfoField = keyof ProviderPersonalInfoForm;

export type ProviderPersonalInfoErrors = Partial<
  Record<ProviderPersonalInfoField, string>
>;

export const PROVIDER_GENDER_OPTIONS: {
  value: ProviderGender;
  label: string;
}[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const EMPTY_PROVIDER_PERSONAL_INFO: ProviderPersonalInfoForm = {
  name: "",
  surname: "",
  dateOfBirth: null,
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  profilePicture: null,
};

export type ProviderServicesJobsForm = {
  careServices: CareServiceCategory[];
  otherCareService: string;
  skills: CareSkill[];
  otherSkill: string;
  /** Kept as text for the input; validated as a whole number. */
  yearsOfExperience: string;
  previousCareExperience: string;
  qualifications: ProfessionalQualification[];
  otherQualification: string;
  languages: SpokenLanguage[];
  otherLanguage: string;
  coverLetter: string;
  jobCategories: CareServiceCategory[];
  tasksWilling: CareTask[];
  tasksUnwilling: CareTask[];
  clientGroups: ClientGroup[];
};

export type ProviderServicesJobsField = keyof ProviderServicesJobsForm;

export type ProviderServicesJobsErrors = Partial<
  Record<ProviderServicesJobsField, string>
>;

export const EMPTY_PROVIDER_SERVICES_JOBS: ProviderServicesJobsForm = {
  careServices: [],
  otherCareService: "",
  skills: [],
  otherSkill: "",
  yearsOfExperience: "",
  previousCareExperience: "",
  qualifications: [],
  otherQualification: "",
  languages: [],
  otherLanguage: "",
  coverLetter: "",
  jobCategories: [],
  tasksWilling: [],
  tasksUnwilling: [],
  clientGroups: [],
};

/** Maps the saved step 1 data into the form (account settings). */
export const personalInfoFormFromProfile = (
  profile: ProviderProfile,
): ProviderPersonalInfoForm => ({
  ...EMPTY_PROVIDER_PERSONAL_INFO,
  name: profile.name,
  surname: profile.surname,
  dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
  gender: profile.gender ?? "",
  email: profile.email,
  phone: profile.phone ?? "",
  addressLine1: profile.address?.addressLine1 ?? "",
  city: profile.address?.city ?? "",
  state: profile.address?.state ?? "",
  postalCode: profile.address?.postalCode ?? "",
});

/** Maps a saved step 2 profile back into the form (used when resuming). */
export const servicesJobsFormFromProfile = (
  profile: ProviderServiceProfile,
): ProviderServicesJobsForm => ({
  careServices: profile.careServices as CareServiceCategory[],
  otherCareService: profile.otherCareService ?? "",
  skills: profile.skills as CareSkill[],
  otherSkill: profile.otherSkill ?? "",
  yearsOfExperience: String(profile.yearsOfExperience),
  previousCareExperience: profile.previousCareExperience,
  qualifications: profile.qualifications as ProfessionalQualification[],
  otherQualification: profile.otherQualification ?? "",
  languages: profile.languages as SpokenLanguage[],
  otherLanguage: profile.otherLanguage ?? "",
  coverLetter: profile.coverLetter,
  jobCategories: profile.jobCategories as CareServiceCategory[],
  tasksWilling: profile.tasksWilling as CareTask[],
  tasksUnwilling: profile.tasksUnwilling as CareTask[],
  clientGroups: profile.clientGroups as ClientGroup[],
});

// ─── Step 4: availability & work preferences ─────────────────────────────────

export type TimeWindowForm = {
  start: Dayjs | null;
  end: Dayjs | null;
  /** The window ends on the following day (overnight hours). */
  endsNextDay: boolean;
};

export type DayScheduleForm = {
  enabled: boolean;
  mode: DayAvailabilityMode;
  windows: TimeWindowForm[];
};

export type ProviderWorkPreferencesForm = {
  /** Keyed by day of week (0 = Sunday … 6 = Saturday). */
  days: Record<number, DayScheduleForm>;
  workType: WorkType | "";
  availabilityStart: AvailabilityStart;
  availableFrom: Dayjs | null;
  acceptsHourly: boolean;
  acceptsFixedPrice: boolean;
  acceptsOneTimeJobs: boolean;
  acceptsDailyJobs: boolean;
  acceptsWeeklyJobs: boolean;
  acceptsMonthlyJobs: boolean;
  availableOvernight: boolean;
  availableLiveIn: boolean;
  availableEmergency: boolean;
  maxTravelDistanceMiles: number;
  offersTransportation: boolean;
  vehicleType: VehicleType | "";
  vehicleWheelchairAccessible: boolean;
  minWeeklyHours: string;
  maxWeeklyHours: string;
  /** Dollars as typed, e.g. "25" or "27.50". */
  preferredHourlyRate: string;
  minHourlyRate: string;
  matchingNotes: string;
};

/** Error keys: form fields plus `day-<n>` for a day's schedule. */
export type ProviderWorkPreferencesErrors = Partial<Record<string, string>>;

export const EMPTY_DAY_SCHEDULE: DayScheduleForm = {
  enabled: false,
  mode: "all_day",
  windows: [],
};

export const EMPTY_PROVIDER_WORK_PREFERENCES: ProviderWorkPreferencesForm = {
  days: Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6].map((day) => [day, EMPTY_DAY_SCHEDULE]),
  ),
  workType: "",
  availabilityStart: "immediate",
  availableFrom: null,
  acceptsHourly: true,
  acceptsFixedPrice: false,
  acceptsOneTimeJobs: true,
  acceptsDailyJobs: false,
  acceptsWeeklyJobs: true,
  acceptsMonthlyJobs: false,
  availableOvernight: false,
  availableLiveIn: false,
  availableEmergency: false,
  maxTravelDistanceMiles: 15,
  offersTransportation: false,
  vehicleType: "",
  vehicleWheelchairAccessible: false,
  minWeeklyHours: "",
  maxWeeklyHours: "",
  preferredHourlyRate: "",
  minHourlyRate: "",
  matchingNotes: "",
};

const timeFromString = (value: string): Dayjs =>
  dayjs(`1970-01-01T${value}:00`);

const centsToDollars = (cents: number): string =>
  (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);

/** Maps saved step 4 preferences back into the form (resume / edit). */
export const workPreferencesFormFromSaved = (
  saved: ProviderWorkPreferences,
): ProviderWorkPreferencesForm => ({
  ...EMPTY_PROVIDER_WORK_PREFERENCES,
  days: Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const workingDay = saved.workingDays.find(
        (item) => item.dayOfWeek === day,
      );
      return [
        day,
        workingDay
          ? {
              enabled: true,
              mode: workingDay.mode,
              windows: workingDay.windows.map((window) => ({
                start: timeFromString(window.start),
                end: timeFromString(window.end),
                endsNextDay: window.endsNextDay,
              })),
            }
          : EMPTY_DAY_SCHEDULE,
      ];
    }),
  ),
  workType: saved.workType,
  availabilityStart: saved.availabilityStart,
  availableFrom: saved.availableFrom ? dayjs(saved.availableFrom) : null,
  acceptsHourly: saved.acceptsHourly,
  acceptsFixedPrice: saved.acceptsFixedPrice,
  acceptsOneTimeJobs: saved.acceptsOneTimeJobs,
  acceptsDailyJobs: saved.acceptsDailyJobs,
  acceptsWeeklyJobs: saved.acceptsWeeklyJobs,
  acceptsMonthlyJobs: saved.acceptsMonthlyJobs,
  availableOvernight: saved.availableOvernight,
  availableLiveIn: saved.availableLiveIn,
  availableEmergency: saved.availableEmergency,
  maxTravelDistanceMiles: saved.maxTravelDistanceMiles,
  offersTransportation: saved.offersTransportation,
  vehicleType: saved.vehicleType ?? "",
  vehicleWheelchairAccessible: saved.vehicleWheelchairAccessible ?? false,
  minWeeklyHours: String(saved.minWeeklyHours),
  maxWeeklyHours: String(saved.maxWeeklyHours),
  preferredHourlyRate: centsToDollars(saved.preferredHourlyRateCents),
  minHourlyRate: centsToDollars(saved.minHourlyRateCents),
  matchingNotes: saved.matchingNotes ?? "",
});

export const formatTime = (value: Dayjs): string => value.format(TIME_FORMAT);
