import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CareRequestStatus } from '../../../generated/prisma/client.js';
import { ProviderRepository } from '../provider.repository';
import { ProviderCareRequestsRepository } from './care-requests.repository';

const STATUS_MAP: Record<string, CareRequestStatus> = {
  pending: CareRequestStatus.PENDING,
  accepted: CareRequestStatus.ACCEPTED,
  rejected: CareRequestStatus.REJECTED,
  completed: CareRequestStatus.COMPLETED,
};

@Injectable()
export class ProviderCareRequestsService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly careRequestsRepository: ProviderCareRequestsRepository,
  ) {}

  async list(userId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    return this.careRequestsRepository.listByProviderId(provider.id);
  }

  async accept(userId: string, requestId: string) {
    return this.updateStatus(userId, requestId, 'accepted');
  }

  async reject(userId: string, requestId: string) {
    return this.updateStatus(userId, requestId, 'rejected');
  }

  async updateStatus(userId: string, requestId: string, statusRaw: unknown) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const status = this.resolveStatus(statusRaw);

    const updated = await this.careRequestsRepository.updateStatus(
      provider.id,
      requestId,
      status,
    );

    if (updated.count === 0) {
      throw new NotFoundException('Care request not found');
    }

    return { success: true };
  }

  private resolveStatus(statusRaw: unknown): CareRequestStatus {
    if (typeof statusRaw !== 'string') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'status must be a string',
      });
    }

    const normalized = statusRaw.trim().toLowerCase();
    const status = STATUS_MAP[normalized];
    if (!status) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message:
          'status must be one of: pending, accepted, rejected, completed',
      });
    }

    return status;
  }
}
