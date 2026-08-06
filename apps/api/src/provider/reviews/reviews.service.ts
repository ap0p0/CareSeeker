import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProviderRepository } from '../provider.repository';
import { ProviderReviewsRepository } from './reviews.repository';
import type { CreateReviewPayload, UpdateReviewPayload } from './reviews.types';

@Injectable()
export class ProviderReviewsService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly reviewsRepository: ProviderReviewsRepository,
  ) {}

  async list(userId: string) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    return this.reviewsRepository.listByProviderUserId(provider.userId);
  }

  async create(userId: string, rawPayload: unknown) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const payload = this.validateCreatePayload(rawPayload);
    return this.reviewsRepository.create(provider.userId, payload);
  }

  async update(userId: string, reviewId: string, rawPayload: unknown) {
    const provider = await this.providerRepository.ensureByUserId(userId);
    const payload = this.validateUpdatePayload(rawPayload);
    const updated = await this.reviewsRepository.update(
      provider.userId,
      reviewId,
      payload,
    );

    if (updated.count === 0) {
      throw new NotFoundException('Review not found');
    }

    return { success: true };
  }

  private validateCreatePayload(rawPayload: unknown): CreateReviewPayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = rawPayload as Record<string, unknown>;
    const errors: string[] = [];

    const careSeekerId =
      typeof body.careSeekerId === 'string' ? body.careSeekerId.trim() : '';
    if (!careSeekerId) {
      errors.push('careSeekerId is required');
    }

    const rating =
      typeof body.rating === 'number' ? Math.trunc(body.rating) : NaN;
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('rating must be an integer between 1 and 5');
    }

    let comment: string | undefined;
    if (Object.prototype.hasOwnProperty.call(body, 'comment')) {
      if (typeof body.comment !== 'string') {
        errors.push('comment must be a string');
      } else {
        comment = body.comment.trim();
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid review payload',
        errors,
      });
    }

    return {
      careSeekerId,
      rating,
      comment,
    };
  }

  private validateUpdatePayload(rawPayload: unknown): UpdateReviewPayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const body = rawPayload as Record<string, unknown>;
    const payload: UpdateReviewPayload = {};
    const errors: string[] = [];

    if (Object.prototype.hasOwnProperty.call(body, 'rating')) {
      if (typeof body.rating !== 'number') {
        errors.push('rating must be a number');
      } else {
        const rating = Math.trunc(body.rating);
        if (rating < 1 || rating > 5) {
          errors.push('rating must be between 1 and 5');
        } else {
          payload.rating = rating;
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'comment')) {
      if (typeof body.comment !== 'string') {
        errors.push('comment must be a string');
      } else {
        payload.comment = body.comment.trim();
      }
    }

    if (Object.keys(payload).length === 0) {
      errors.push('At least one field is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid review payload',
        errors,
      });
    }

    return payload;
  }
}
