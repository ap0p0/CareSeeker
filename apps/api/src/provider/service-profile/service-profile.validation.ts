import { BadRequestException } from '@nestjs/common';
import {
  CareServiceCategory,
  CareSkill,
  CareTask,
  ClientGroup,
  ProfessionalQualification,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import type { ProviderServiceProfileInput } from './service-profile.types';

export const YEARS_OF_EXPERIENCE_MAX = 60;
export const OTHER_TEXT_MAX_LENGTH = 100;
export const PREVIOUS_EXPERIENCE_MAX_LENGTH = 2000;
export const COVER_LETTER_MIN_LENGTH = 20;
export const COVER_LETTER_MAX_LENGTH = 1000;

/**
 * Parses a multi-select answer: must be an array of known enum values
 * (case-insensitive), de-duplicated. Unknown values are rejected rather than
 * silently dropped so API clients notice typos.
 */
function parseSelection<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
  errors: string[],
  options: { min?: number; exclude?: readonly T[] } = {},
): T[] {
  if (typeof value === 'undefined' || value === null) {
    if (options.min)
      errors.push(`${field} must include at least ${options.min} option`);
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array`);
    return [];
  }

  const allowedSet = new Set<string>(allowed);
  const excluded = new Set<string>(options.exclude ?? []);
  const unique = new Set<T>();

  for (const item of value) {
    const normalized =
      typeof item === 'string' ? item.trim().toUpperCase() : '';
    if (!allowedSet.has(normalized) || excluded.has(normalized)) {
      errors.push(`${field} contains an invalid option: ${String(item)}`);
      return [];
    }
    unique.add(normalized as T);
  }

  if (options.min && unique.size < options.min) {
    errors.push(`${field} must include at least ${options.min} option`);
  }

  return Array.from(unique);
}

function parseText(
  value: unknown,
  field: string,
  errors: string[],
  options: { required: boolean; min?: number; max: number },
): string | null {
  if (typeof value === 'undefined' || value === null) {
    if (options.required) errors.push(`${field} is required`);
    return null;
  }

  if (typeof value !== 'string') {
    errors.push(`${field} must be a string`);
    return null;
  }

  const text = value.trim();
  if (!text) {
    if (options.required) errors.push(`${field} is required`);
    return null;
  }

  if (options.min && text.length < options.min) {
    errors.push(`${field} must be at least ${options.min} characters`);
    return null;
  }

  if (text.length > options.max) {
    errors.push(`${field} must be at most ${options.max} characters`);
    return null;
  }

  return text;
}

/**
 * "Other (specify)" text: required exactly when `OTHER` is selected, ignored
 * (stored as null) otherwise.
 */
function parseOtherText(
  value: unknown,
  field: string,
  otherSelected: boolean,
  errors: string[],
): string | null {
  if (!otherSelected) return null;

  const text = parseText(value, field, errors, {
    required: false,
    max: OTHER_TEXT_MAX_LENGTH,
  });
  if (!text && !errors.some((error) => error.startsWith(`${field} `))) {
    errors.push(`${field} is required when "Other" is selected`);
  }

  return text;
}

function parseYears(value: unknown, errors: string[]): number {
  const years =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim().length > 0
        ? Number(value)
        : NaN;

  if (
    !Number.isInteger(years) ||
    years < 0 ||
    years > YEARS_OF_EXPERIENCE_MAX
  ) {
    errors.push(
      `yearsOfExperience must be a whole number between 0 and ${YEARS_OF_EXPERIENCE_MAX}`,
    );
    return 0;
  }

  return years;
}

export function validateServiceProfilePayload(
  rawPayload: unknown,
): ProviderServiceProfileInput {
  if (!rawPayload || typeof rawPayload !== 'object') {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Payload must be an object',
    });
  }

  const body = rawPayload as Record<string, unknown>;
  const errors: string[] = [];

  const careServices = parseSelection(
    body.careServices,
    'careServices',
    Object.values(CareServiceCategory),
    errors,
    { min: 1 },
  );
  const otherCareService = parseOtherText(
    body.otherCareService,
    'otherCareService',
    careServices.includes(CareServiceCategory.OTHER),
    errors,
  );

  const skills = parseSelection(
    body.skills,
    'skills',
    Object.values(CareSkill),
    errors,
    { min: 1 },
  );
  const otherSkill = parseOtherText(
    body.otherSkill,
    'otherSkill',
    skills.includes(CareSkill.OTHER),
    errors,
  );

  const yearsOfExperience = parseYears(body.yearsOfExperience, errors);
  const previousCareExperience = parseText(
    body.previousCareExperience,
    'previousCareExperience',
    errors,
    { required: true, max: PREVIOUS_EXPERIENCE_MAX_LENGTH },
  );

  const qualifications = parseSelection(
    body.qualifications,
    'qualifications',
    Object.values(ProfessionalQualification),
    errors,
  );
  const otherQualification = parseOtherText(
    body.otherQualification,
    'otherQualification',
    qualifications.includes(ProfessionalQualification.OTHER),
    errors,
  );

  const languages = parseSelection(
    body.languages,
    'languages',
    Object.values(SpokenLanguage),
    errors,
    { min: 1 },
  );
  const otherLanguage = parseOtherText(
    body.otherLanguage,
    'otherLanguage',
    languages.includes(SpokenLanguage.OTHER),
    errors,
  );

  const coverLetter = parseText(body.coverLetter, 'coverLetter', errors, {
    required: true,
    min: COVER_LETTER_MIN_LENGTH,
    max: COVER_LETTER_MAX_LENGTH,
  });

  // "Other" has no free text on the job-interest side, so it is not offered.
  const jobCategories = parseSelection(
    body.jobCategories,
    'jobCategories',
    Object.values(CareServiceCategory),
    errors,
    { min: 1, exclude: [CareServiceCategory.OTHER] },
  );

  const tasksWilling = parseSelection(
    body.tasksWilling,
    'tasksWilling',
    Object.values(CareTask),
    errors,
    { min: 1 },
  );
  const tasksUnwilling = parseSelection(
    body.tasksUnwilling,
    'tasksUnwilling',
    Object.values(CareTask),
    errors,
  );
  const overlap = tasksWilling.filter((task) => tasksUnwilling.includes(task));
  if (overlap.length > 0) {
    errors.push(
      `tasksUnwilling cannot repeat tasks listed in tasksWilling: ${overlap
        .map((task) => task.toLowerCase())
        .join(', ')}`,
    );
  }

  const clientGroups = parseSelection(
    body.clientGroups,
    'clientGroups',
    Object.values(ClientGroup),
    errors,
    { min: 1 },
  );

  if (errors.length > 0 || !previousCareExperience || !coverLetter) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid services & job interests payload',
      errors,
    });
  }

  return {
    careServices,
    otherCareService,
    skills,
    otherSkill,
    yearsOfExperience,
    previousCareExperience,
    qualifications,
    otherQualification,
    languages,
    otherLanguage,
    coverLetter,
    jobCategories,
    tasksWilling,
    tasksUnwilling,
    clientGroups,
  };
}
