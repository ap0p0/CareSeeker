import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import { ProviderProfileRepository } from './profile.repository';
import type {
  ProviderProfileResponse,
  UpdateProviderProfilePayload,
} from './profile.types';

@Injectable()
export class ProviderProfileService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly profileRepository: ProviderProfileRepository,
  ) {}

  async getProfile(userId: string): Promise<ProviderProfileResponse> {
    const profile = await this.requireProfile(userId);
    const status =
      profile.providerVerificationStatus === 'APPROVED'
        ? 'active'
        : 'pending_verification';

    return {
      id: profile.id,
      userId: profile.id,
      name: profile.name,
      email: profile.email,
      phone: null,
      bio: null,
      profileImage: null,
      status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateProfile(userId: string, rawPayload: unknown) {
    const payload = this.validateUpdatePayload(rawPayload);

    await this.requireProfile(userId);

    const updated = await this.profileRepository.updateByUserId(
      userId,
      payload,
    );
    const status =
      updated.providerVerificationStatus === 'APPROVED'
        ? 'active'
        : 'pending_verification';

    return {
      id: updated.id,
      userId: updated.id,
      name: updated.name,
      email: updated.email,
      phone: null,
      bio: null,
      profileImage: null,
      status,
      updatedAt: updated.updatedAt,
    };
  }

  private async requireProfile(userId: string) {
    const existing = await this.profileRepository.findByUserId(userId);
    if (existing) return existing;

    await this.providerRepository.ensureByUserId(userId);
    const resolved = await this.profileRepository.findByUserId(userId);
    if (!resolved) {
      throw new NotFoundException('Provider profile not found');
    }

    return resolved;
  }

  private validateUpdatePayload(
    rawPayload: unknown,
  ): UpdateProviderProfilePayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = rawPayload as Record<string, unknown>;
    const payload: UpdateProviderProfilePayload = {};
    const errors: string[] = [];

    if (Object.prototype.hasOwnProperty.call(body, 'name')) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        errors.push('name must be a non-empty string');
      } else {
        payload.name = body.name.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'phone')) {
      if (body.phone === null) {
        payload.phone = null;
      } else if (typeof body.phone !== 'string') {
        errors.push('phone must be a string or null');
      } else {
        payload.phone = body.phone.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'bio')) {
      if (body.bio === null) {
        payload.bio = null;
      } else if (typeof body.bio !== 'string') {
        errors.push('bio must be a string or null');
      } else {
        payload.bio = body.bio.trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'profileImage')) {
      if (body.profileImage === null) {
        payload.profileImage = null;
      } else if (typeof body.profileImage !== 'string') {
        errors.push('profileImage must be a string or null');
      } else {
        payload.profileImage = body.profileImage.trim();
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid profile payload',
        errors,
      });
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'At least one profile field must be provided',
      });
    }

    return payload;
  }
}
