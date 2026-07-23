import { BadRequestException, Injectable } from '@nestjs/common';
import { getSupabaseAdminClient } from '../../auth/supabase-admin';
import { ProviderRepository } from '../provider.repository';
import { ProviderAccountSettingsRepository } from './account-settings.repository';
import type { UpdateProviderAccountSettingsPayload } from './account-settings.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ProviderAccountSettingsService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly accountSettingsRepository: ProviderAccountSettingsRepository,
  ) {}

  async get(userId: string) {
    await this.providerRepository.ensureByUserId(userId);
    const data = await this.accountSettingsRepository.getByUserId(userId);

    return {
      email: data.user?.email ?? null,
      name: data.user?.name ?? null,
      phone: null,
    };
  }

  async update(userId: string, rawPayload: unknown) {
    await this.providerRepository.ensureByUserId(userId);
    const payload = this.validatePayload(rawPayload);

    const supabaseAdmin = getSupabaseAdminClient();

    if (payload.email || payload.password) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: payload.email,
        password: payload.password,
      });

      if (error) {
        throw new BadRequestException({
          code: 'AUTH_UPDATE_FAILED',
          message: error.message,
        });
      }
    }

    await this.accountSettingsRepository.updateByUserId(userId, payload);

    return { success: true };
  }

  private validatePayload(rawPayload: unknown): UpdateProviderAccountSettingsPayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = rawPayload as Record<string, unknown>;
    const payload: UpdateProviderAccountSettingsPayload = {};
    const errors: string[] = [];

    if (Object.prototype.hasOwnProperty.call(body, 'email')) {
      if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email.trim().toLowerCase())) {
        errors.push('email must be a valid email address');
      } else {
        payload.email = body.email.trim().toLowerCase();
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'password')) {
      if (typeof body.password !== 'string' || body.password.trim().length < 6) {
        errors.push('password must be at least 6 characters');
      } else {
        payload.password = body.password.trim();
      }
    }

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

    if (Object.keys(payload).length === 0) {
      errors.push('At least one field is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid account settings payload',
        errors,
      });
    }

    return payload;
  }
}
