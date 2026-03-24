import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, PresignupType } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import type {
  PresignupValidationResult,
  ProviderPresignupRequest,
  SeekerPresignupRequest,
} from './presignups.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class PresignupsService {
  constructor(private prisma: PrismaService) {}

  async createSeeker(rawPayload: unknown) {
    const validation = this.validateSeekerPayload(rawPayload);
    if (!validation.isValid) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid seeker presignup payload',
        errors: validation.errors,
      });
    }

    return this.createPresignupRecord(PresignupType.SEEKER, validation.value);
  }

  async createProvider(rawPayload: unknown) {
    const validation = this.validateProviderPayload(rawPayload);
    if (!validation.isValid) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid provider presignup payload',
        errors: validation.errors,
      });
    }

    return this.createPresignupRecord(PresignupType.PROVIDER, validation.value);
  }

  private async createPresignupRecord(
    type: PresignupType,
    payload: SeekerPresignupRequest | ProviderPresignupRequest,
  ) {
    try {
      const created = await this.prisma.presignup.create({
        data: {
          type,
          name: payload.name,
          surname: payload.surname,
          email: payload.email,
          accepted: payload.accepted,
          state: 'state' in payload ? payload.state : null,
          city: 'city' in payload ? payload.city : null,
          phone: 'phone' in payload ? (payload.phone ?? null) : null,
        },
      });

      return {
        id: created.id,
        type: created.type.toLowerCase(),
        email: created.email,
        createdAt: created.createdAt,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'DUPLICATE_EMAIL',
          message: 'This email has already been registered',
        });
      }
      throw error;
    }
  }

  private validateSeekerPayload(
    payload: unknown,
  ): PresignupValidationResult<SeekerPresignupRequest> {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Payload must be an object'] };
    }

    const body = payload as Record<string, unknown>;
    const errors: string[] = [];

    const name = this.readRequiredString(body, 'name', errors);
    const surname = this.readRequiredString(body, 'surname', errors);
    const email = this.readRequiredEmail(body, errors);
    const accepted = this.readAcceptedFlag(body, errors);

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      value: { name, surname, email, accepted },
    };
  }

  private validateProviderPayload(
    payload: unknown,
  ): PresignupValidationResult<ProviderPresignupRequest> {
    if (!payload || typeof payload !== 'object') {
      return { isValid: false, errors: ['Payload must be an object'] };
    }

    const body = payload as Record<string, unknown>;
    const errors: string[] = [];

    const name = this.readRequiredString(body, 'name', errors);
    const surname = this.readRequiredString(body, 'surname', errors);
    const email = this.readRequiredEmail(body, errors);
    const state = this.readRequiredString(body, 'state', errors);
    const city = this.readRequiredString(body, 'city', errors);
    const accepted = this.readAcceptedFlag(body, errors);

    const phone = this.readAndNormalizeOptionalPhone(body, errors);

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      value: { name, surname, email, state, city, phone, accepted },
    };
  }

  private readRequiredString(
    body: Record<string, unknown>,
    field: string,
    errors: string[],
  ) {
    const value = body[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${field} is required`);
      return '';
    }
    return value.trim();
  }

  private readRequiredEmail(body: Record<string, unknown>, errors: string[]) {
    const value = body['email'];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push('email is required');
      return '';
    }

    const normalized = value.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      errors.push('email must be a valid email address');
      return '';
    }

    return normalized;
  }

  private readAndNormalizeOptionalPhone(
    body: Record<string, unknown>,
    errors: string[],
  ) {
    const value = body['phone'];
    if (typeof value === 'undefined' || value === null) return undefined;
    if (typeof value !== 'string') {
      errors.push('phone must be a string');
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) return undefined;

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length !== 10) {
      errors.push('phone must include exactly 10 digits when provided');
      return undefined;
    }

    return digits;
  }

  private readAcceptedFlag(body: Record<string, unknown>, errors: string[]) {
    const value = body['accepted'];
    if (value !== true) {
      errors.push('accepted must be true');
      return false;
    }
    return true;
  }
}
