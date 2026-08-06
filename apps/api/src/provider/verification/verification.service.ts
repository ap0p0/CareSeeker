import { BadRequestException, Injectable } from '@nestjs/common';
import { ProviderVerificationStatus } from '../../../generated/prisma/client.js';
import { ProviderRepository } from '../provider.repository';
import { ProviderVerificationRepository } from './verification.repository';
import type { SubmitVerificationPayload } from './verification.types';

@Injectable()
export class ProviderVerificationService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly verificationRepository: ProviderVerificationRepository,
  ) {}

  async submit(userId: string, rawPayload: unknown) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const payload = this.validatePayload(rawPayload);

    const record = await this.verificationRepository.create(
      provider.id,
      payload.documentType,
      payload.documentUrl,
    );

    await this.verificationRepository.updateUserVerificationStatus(
      userId,
      ProviderVerificationStatus.PENDING,
    );

    return record;
  }

  async status(userId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const latest = await this.verificationRepository.latestByProviderId(
      provider.id,
    );

    return {
      status: latest?.status.toLowerCase() ?? 'pending',
      documentType: latest?.documentType ?? null,
      documentUrl: latest?.documentUrl ?? null,
      updatedAt: latest?.updatedAt ?? null,
    };
  }

  private validatePayload(rawPayload: unknown): SubmitVerificationPayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = rawPayload as Record<string, unknown>;
    const documentType =
      typeof body.documentType === 'string' ? body.documentType.trim() : '';
    const documentUrl =
      typeof body.documentUrl === 'string' ? body.documentUrl.trim() : '';

    const errors: string[] = [];

    if (!documentType) {
      errors.push('documentType is required');
    }

    if (!documentUrl) {
      errors.push('documentUrl is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid verification payload',
        errors,
      });
    }

    return { documentType, documentUrl };
  }
}
