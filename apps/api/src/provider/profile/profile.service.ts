import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  hasOwn,
  parseAddress,
  parseDateOfBirth,
  parseGender,
  parseName,
  parsePhone,
} from '../common/personal-info.validation';
import { ProviderProfileImageStorageService } from '../common/profile-image-storage.service';
import {
  requireValidProfileImage,
  type UploadedFile,
} from '../common/uploaded-file';
import { ProviderRepository } from '../provider.repository';
import {
  ProviderProfileRepository,
  type ProviderProfileRecord,
} from './profile.repository';
import type {
  ProviderProfileResponse,
  UpdateProviderProfilePayload,
} from './profile.types';

const ADDRESS_FIELDS = ['addressLine1', 'city', 'state', 'postalCode'] as const;

const PERSONAL_INFO_FIELDS = [
  'dateOfBirth',
  'gender',
  'phone',
  ...ADDRESS_FIELDS,
] as const;

@Injectable()
export class ProviderProfileService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly profileRepository: ProviderProfileRepository,
    private readonly profileImageStorage: ProviderProfileImageStorageService,
  ) {}

  async getProfile(userId: string): Promise<ProviderProfileResponse> {
    const profile = await this.requireProfile(userId);
    return this.toResponse(profile);
  }

  async updateProfile(
    userId: string,
    rawPayload: unknown,
  ): Promise<ProviderProfileResponse> {
    const existing = await this.requireProfile(userId);
    const payload = this.validateUpdatePayload(rawPayload, {
      // Accounts created before onboarding step 1 have no providers_info row:
      // the first personal-info update must then contain every required field.
      requireCompletePersonalInfo: existing.providersInfo === null,
    });

    const updated = await this.profileRepository.updateByUserId(
      userId,
      payload,
      { hasPersonalInfo: existing.providersInfo !== null },
    );

    return this.toResponse(updated);
  }

  /**
   * Replaces the profile picture. The previous object is removed from storage
   * only after the new path has been persisted.
   */
  async updateProfilePicture(
    userId: string,
    file: UploadedFile | undefined,
  ): Promise<ProviderProfileResponse> {
    const existing = await this.requireProfile(userId);
    const picture = requireValidProfileImage(file);

    if (!existing.providersInfo) {
      throw new ConflictException({
        code: 'PERSONAL_INFO_REQUIRED',
        message:
          'Complete your personal information before uploading a profile picture.',
      });
    }

    const previousPath = existing.providersInfo.profileImagePath;
    const newPath = await this.profileImageStorage.upload(userId, picture);

    let updated: ProviderProfileRecord;
    try {
      updated = await this.profileRepository.updateProfileImagePath(
        userId,
        newPath,
      );
    } catch (error) {
      await this.profileImageStorage.remove(newPath);
      throw error;
    }

    if (previousPath && previousPath !== newPath) {
      await this.profileImageStorage.remove(previousPath);
    }

    return this.toResponse(updated);
  }

  private async toResponse(
    profile: ProviderProfileRecord,
  ): Promise<ProviderProfileResponse> {
    const info = profile.providersInfo;
    const status =
      profile.providerVerificationStatus === 'APPROVED'
        ? 'active'
        : 'pending_verification';

    return {
      id: profile.id,
      userId: profile.id,
      name: profile.name,
      surname: profile.surname,
      email: profile.email,
      dateOfBirth: info ? info.dateOfBirth.toISOString().slice(0, 10) : null,
      gender: info?.gender ? info.gender.toLowerCase() : null,
      phone: info?.phone ?? null,
      address: info
        ? {
            addressLine1: info.addressLine1,
            city: info.city,
            state: info.state,
            postalCode: info.postalCode,
          }
        : null,
      profileImageUrl: await this.profileImageStorage.getSignedUrl(
        info?.profileImagePath,
      ),
      status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private async requireProfile(userId: string): Promise<ProviderProfileRecord> {
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
    options: { requireCompletePersonalInfo: boolean },
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

    if (hasOwn(body, 'name')) {
      const name = parseName(body.name, 'name', errors);
      if (name) payload.name = name;
    }

    if (hasOwn(body, 'surname')) {
      const surname = parseName(body.surname, 'surname', errors);
      if (surname) payload.surname = surname;
    }

    const touchesPersonalInfo = PERSONAL_INFO_FIELDS.some((field) =>
      hasOwn(body, field),
    );
    const touchesAddress = ADDRESS_FIELDS.some((field) => hasOwn(body, field));
    const mustBeComplete =
      options.requireCompletePersonalInfo && touchesPersonalInfo;

    if (hasOwn(body, 'dateOfBirth') || mustBeComplete) {
      const dateOfBirth = parseDateOfBirth(body.dateOfBirth, errors);
      if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
    }

    if (hasOwn(body, 'gender')) {
      payload.gender = parseGender(body.gender, errors);
    }

    if (hasOwn(body, 'phone') || mustBeComplete) {
      const phone = parsePhone(body.phone, errors);
      if (phone) payload.phone = phone;
    }

    if (touchesAddress || mustBeComplete) {
      const address = parseAddress(body, errors);
      if (address) payload.address = address;
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: mustBeComplete
          ? 'Complete personal information is required before partial updates'
          : 'Invalid profile payload',
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
