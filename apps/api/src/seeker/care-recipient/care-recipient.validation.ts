import { BadRequestException } from '@nestjs/common';
import {
  EthnicBackground,
  LivingSituation,
  MobilityLevel,
  SpokenLanguage,
} from '../../../generated/prisma/client.js';
import {
  parseOtherText,
  parseRequiredEnum,
  parseSelection,
  parseText,
} from '../../common/field-parsers';
import {
  parseAddress,
  parseDateOfBirth,
  parseGender,
  parseName,
} from '../../common/personal-info.validation';
import type { CareRecipientInput } from './care-recipient.types';

/** Anyone can receive care, babies included. */
export const MIN_RECIPIENT_AGE = 0;
export const MAX_RECIPIENT_AGE = 120;
export const ADDITIONAL_INFO_MAX_LENGTH = 2000;

/**
 * `PUT /seeker/care-recipient` — full replacement of step 2. Every rule is
 * enforced here regardless of the frontend; all messages are returned
 * together as a single `400 VALIDATION_ERROR`.
 */
export function validateCareRecipientPayload(
  rawPayload: unknown,
  today = new Date(),
): CareRecipientInput {
  if (!rawPayload || typeof rawPayload !== 'object') {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Payload must be an object',
    });
  }

  const body = rawPayload as Record<string, unknown>;
  const errors: string[] = [];

  const name = parseName(body.name, 'name', errors);
  const surname = parseName(body.surname, 'surname', errors);
  const dateOfBirth = parseDateOfBirth(
    body.dateOfBirth,
    errors,
    { minAge: MIN_RECIPIENT_AGE, maxAge: MAX_RECIPIENT_AGE },
    today,
  );
  const gender = parseGender(body.gender, errors, { required: true });
  const address = parseAddress(body, errors);

  const livingSituation = parseRequiredEnum(
    body.livingSituation,
    'livingSituation',
    Object.values(LivingSituation),
    errors,
  );
  const mobilityLevel = parseRequiredEnum(
    body.mobilityLevel,
    'mobilityLevel',
    Object.values(MobilityLevel),
    errors,
  );

  const languagesSpoken = parseSelection(
    body.languagesSpoken,
    'languagesSpoken',
    Object.values(SpokenLanguage),
    errors,
    { min: 1 },
  );
  const otherLanguage = parseOtherText(
    body.otherLanguage,
    'otherLanguage',
    languagesSpoken.includes(SpokenLanguage.OTHER),
    errors,
  );

  const ethnicBackground = parseRequiredEnum(
    body.ethnicBackground,
    'ethnicBackground',
    Object.values(EthnicBackground),
    errors,
  );

  const additionalInfo = parseText(
    body.additionalInfo,
    'additionalInfo',
    errors,
    { required: false, max: ADDITIONAL_INFO_MAX_LENGTH },
  );

  if (
    errors.length > 0 ||
    !name ||
    !surname ||
    !dateOfBirth ||
    !gender ||
    !address ||
    !livingSituation ||
    !mobilityLevel ||
    !ethnicBackground
  ) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Invalid care recipient payload',
      errors,
    });
  }

  return {
    name,
    surname,
    dateOfBirth,
    gender,
    ...address,
    livingSituation,
    mobilityLevel,
    languagesSpoken,
    otherLanguage,
    ethnicBackground,
    additionalInfo,
  };
}
