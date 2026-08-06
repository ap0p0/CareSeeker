import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import { ProviderAvailabilityRepository } from './availability.repository';
import type {
  AvailabilityPayload,
  AvailabilityUpdatePayload,
} from './availability.types';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

@Injectable()
export class ProviderAvailabilityService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly availabilityRepository: ProviderAvailabilityRepository,
  ) {}

  async list(userId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    return this.availabilityRepository.listByProviderId(provider.id);
  }

  async create(userId: string, rawPayload: unknown) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const payload = this.validateCreatePayload(rawPayload);

    return this.availabilityRepository.create(provider.id, payload);
  }

  async update(userId: string, availabilityId: string, rawPayload: unknown) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const payload = this.validateUpdatePayload(rawPayload);

    const updated = await this.availabilityRepository.update(
      provider.id,
      availabilityId,
      payload,
    );

    if (updated.count === 0) {
      throw new NotFoundException('Availability not found');
    }

    return { success: true };
  }

  async remove(userId: string, availabilityId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const deleted = await this.availabilityRepository.delete(
      provider.id,
      availabilityId,
    );

    if (deleted.count === 0) {
      throw new NotFoundException('Availability not found');
    }

    return { success: true };
  }

  private validateCreatePayload(rawPayload: unknown): AvailabilityPayload {
    return this.validatePayload(rawPayload, false) as AvailabilityPayload;
  }

  private validateUpdatePayload(
    rawPayload: unknown,
  ): AvailabilityUpdatePayload {
    return this.validatePayload(rawPayload, true) as AvailabilityUpdatePayload;
  }

  private validatePayload(rawPayload: unknown, partial: boolean) {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = rawPayload as Record<string, unknown>;
    const errors: string[] = [];
    const payload: AvailabilityPayload | AvailabilityUpdatePayload = {};

    if (Object.prototype.hasOwnProperty.call(body, 'dayOfWeek')) {
      if (
        typeof body.dayOfWeek !== 'number' ||
        body.dayOfWeek < 0 ||
        body.dayOfWeek > 6
      ) {
        errors.push('dayOfWeek must be an integer between 0 and 6');
      } else {
        payload.dayOfWeek = Math.trunc(body.dayOfWeek);
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'date')) {
      if (
        typeof body.date !== 'string' ||
        Number.isNaN(new Date(body.date).getTime())
      ) {
        errors.push('date must be a valid date string');
      } else {
        payload.date = body.date;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'startTime')) {
      if (
        typeof body.startTime !== 'string' ||
        !TIME_REGEX.test(body.startTime)
      ) {
        errors.push('startTime must be in HH:mm format');
      } else {
        payload.startTime = body.startTime;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'endTime')) {
      if (typeof body.endTime !== 'string' || !TIME_REGEX.test(body.endTime)) {
        errors.push('endTime must be in HH:mm format');
      } else {
        payload.endTime = body.endTime;
      }
    }

    if (!partial) {
      if (!('startTime' in payload)) errors.push('startTime is required');
      if (!('endTime' in payload)) errors.push('endTime is required');
      const hasDayOfWeek = 'dayOfWeek' in payload;
      const hasDate = 'date' in payload;
      if (hasDayOfWeek === hasDate) {
        errors.push('Provide either dayOfWeek or date');
      }
    }

    if (partial) {
      if (Object.keys(payload).length === 0) {
        errors.push('At least one field is required');
      }

      const hasDayOfWeek = 'dayOfWeek' in payload;
      const hasDate = 'date' in payload;
      if (hasDayOfWeek && hasDate) {
        errors.push('Use dayOfWeek or date, not both');
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid availability payload',
        errors,
      });
    }

    return payload;
  }
}
