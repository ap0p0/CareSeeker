import dayjs, { type Dayjs } from "dayjs";
import type {
  CreateJobPayload,
  JobDraft,
  JobTextPayload,
} from "../../../../queries/client";
import { US_ZIP_REGEX } from "../../../../utils/usAddress";
import { isUsStateCode } from "../../../../utils/usStates";
import { CARE_NEEDS_FIELD_ORDER } from "../../components/CareNeedsFields";
import {
  carePreferencesFormFromSaved,
  EMPTY_CARE_PREFERENCES,
  isOneTimeCare,
  toCarePreferencesPayload,
  type CarePreferencesErrors,
  type CarePreferencesForm,
} from "../Register/carePreferencesForm";
import { validateCarePreferences } from "../Register/validation";

/** Mirrors the API (`apps/api/src/seeker/jobs/jobs.validation.ts`). */
export const JOB_TITLE_MIN_LENGTH = 5;
export const JOB_TITLE_MAX_LENGTH = 100;
export const JOB_DESCRIPTION_MIN_LENGTH = 20;
export const JOB_DESCRIPTION_MAX_LENGTH = 2000;
export const CITY_MAX_LENGTH = 100;

/**
 * A job post being written: its text, where care takes place (no street
 * address) and the care details, which reuse the registration step 3 form
 * model so the same questions, rules and payload mapping apply.
 */
export type JobPostForm = {
  title: string;
  description: string;
  city: string;
  /** USPS state code. */
  state: string;
  postalCode: string;
  details: CarePreferencesForm;
};

type JobPostField = "title" | "description" | "city" | "state" | "postalCode";

export type JobPostErrors = Partial<Record<JobPostField, string>>;

/** Every field of the page in order, for focusing the first invalid one. */
export const JOB_POST_FIELD_ORDER = [
  "title",
  "description",
  "city",
  "state",
  "postalCode",
  ...CARE_NEEDS_FIELD_ORDER,
];

/** "Create a new post": nothing filled in. */
export const EMPTY_JOB_POST_FORM: JobPostForm = {
  title: "",
  description: "",
  city: "",
  state: "",
  postalCode: "",
  details: EMPTY_CARE_PREFERENCES,
};

export const jobPostFormFromDraft = (draft: JobDraft): JobPostForm => ({
  title: draft.title,
  description: draft.description,
  city: draft.city,
  state: draft.state,
  postalCode: draft.postalCode,
  details: draft.details
    ? carePreferencesFormFromSaved(draft.details)
    : EMPTY_CARE_PREFERENCES,
});

/** The prefilled one-time visit lies in the past (registration was a while ago). */
export const hasPastVisitDate = (
  form: JobPostForm,
  today: Dayjs = dayjs(),
): boolean =>
  isOneTimeCare(form.details) &&
  Boolean(form.details.visitDate?.isValid()) &&
  Boolean(form.details.visitDate?.isBefore(today, "day"));

export const toJobTextPayload = (form: JobPostForm): JobTextPayload => ({
  city: form.city.trim(),
  state: form.state,
  postalCode: form.postalCode.trim(),
  details: toCarePreferencesPayload(form.details),
});

export const toCreateJobPayload = (form: JobPostForm): CreateJobPayload => ({
  ...toJobTextPayload(form),
  title: form.title.trim(),
  description: form.description.trim(),
});

const textError = (
  value: string,
  { label, min, max }: { label: string; min: number; max: number },
): string | undefined => {
  const text = value.trim();
  if (!text) return `Please add a ${label}.`;
  if (text.length < min)
    return `Please write at least ${min} characters for the ${label}.`;
  if (text.length > max)
    return `Please keep the ${label} under ${max} characters.`;
  return undefined;
};

/** City, state and ZIP of the job (`whose`-free copy: it is the job's place). */
export const validateJobLocation = (form: JobPostForm): JobPostErrors => {
  const errors: JobPostErrors = {};

  if (!form.city.trim()) {
    errors.city = "Please enter the city where care is needed.";
  } else if (form.city.trim().length > CITY_MAX_LENGTH) {
    errors.city = `Please keep it under ${CITY_MAX_LENGTH} characters.`;
  }

  if (!form.state) {
    errors.state = "Please select the state.";
  } else if (!isUsStateCode(form.state)) {
    errors.state = "Please select a valid state.";
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = "Please enter the ZIP code.";
  } else if (!US_ZIP_REGEX.test(form.postalCode.trim())) {
    errors.postalCode = "Please enter a valid ZIP code (12345 or 12345-6789).";
  }

  return errors;
};

/** Title and description only (e.g. the job page's quick edit). */
export const validateJobText = (
  form: Pick<JobPostForm, "title" | "description">,
): JobPostErrors => {
  const errors: JobPostErrors = {};
  const title = textError(form.title, {
    label: "title",
    min: JOB_TITLE_MIN_LENGTH,
    max: JOB_TITLE_MAX_LENGTH,
  });
  if (title) errors.title = title;
  const description = textError(form.description, {
    label: "description",
    min: JOB_DESCRIPTION_MIN_LENGTH,
    max: JOB_DESCRIPTION_MAX_LENGTH,
  });
  if (description) errors.description = description;
  return errors;
};

export type JobPostValidation = {
  post: JobPostErrors;
  details: CarePreferencesErrors;
  valid: boolean;
};

/**
 * Everything a job post needs before it is submitted (`withText`) or before
 * a new title / description can be written from its details (no text yet).
 */
export const validateJobPost = (
  form: JobPostForm,
  { withText }: { withText: boolean },
  today: Dayjs = dayjs(),
): JobPostValidation => {
  const post: JobPostErrors = validateJobLocation(form);

  if (withText) Object.assign(post, validateJobText(form));

  const details = validateCarePreferences(form.details, today);

  return {
    post,
    details,
    valid: Object.keys(post).length === 0 && Object.keys(details).length === 0,
  };
};
