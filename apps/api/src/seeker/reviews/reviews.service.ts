import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { ensureObject, isUuid } from '../seeker.validation';
import type { CreateReviewDto, UpdateReviewDto } from './reviews.dto';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async createReview(seekerId: string, body: unknown) {
    const payload = this.validateCreatePayload(body);
    const provider = await this.reviewsRepository.findApprovedProvider(
      payload.providerId,
    );

    if (!provider) {
      throw new NotFoundException({
        code: 'PROVIDER_NOT_FOUND',
        message: 'Approved provider not found',
      });
    }

    try {
      const review = await this.reviewsRepository.createReview(seekerId, payload);
      return this.serializeReview(review);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'REVIEW_ALREADY_EXISTS',
          message: 'A review for this provider already exists',
        });
      }

      throw error;
    }
  }

  async updateReview(seekerId: string, reviewId: string, body: unknown) {
    this.ensureUuid(reviewId, 'reviewId');
    const existing = await this.reviewsRepository.findReview(seekerId, reviewId);
    if (!existing) {
      throw new NotFoundException({
        code: 'REVIEW_NOT_FOUND',
        message: 'Review not found',
      });
    }

    const payload = this.validateUpdatePayload(body);
    const review = await this.reviewsRepository.updateReview(reviewId, payload);
    return this.serializeReview(review);
  }

  async listReviews(seekerId: string) {
    const reviews = await this.reviewsRepository.listReviews(seekerId);
    return reviews.map((review) => this.serializeReview(review));
  }

  async getRatingStatistics(providerId: string) {
    this.ensureUuid(providerId, 'providerId');
    const provider = await this.reviewsRepository.findApprovedProvider(providerId);
    if (!provider) {
      throw new NotFoundException({
        code: 'PROVIDER_NOT_FOUND',
        message: 'Approved provider not found',
      });
    }

    const stats = await this.reviewsRepository.aggregateReviewStats(providerId);

    return {
      providerId,
      averageRating: stats.aggregate._avg.rating ?? 0,
      totalReviews: stats.aggregate._count._all,
      distribution: stats.distribution
        .sort((left, right) => left.rating - right.rating)
        .map((entry) => ({
          rating: entry.rating,
          count: entry._count._all,
        })),
    };
  }

  private validateCreatePayload(payload: unknown): CreateReviewDto {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const providerId =
      typeof body.providerId === 'string' ? body.providerId.trim() : '';
    const rating = body.rating;
    const comment =
      typeof body.comment === 'string' && body.comment.trim().length > 0
        ? body.comment.trim()
        : undefined;
    const errors: string[] = [];

    if (!providerId) {
      errors.push('providerId is required');
    } else if (!isUuid(providerId)) {
      errors.push('providerId must be a valid UUID');
    }

    if (typeof rating !== 'number' || !Number.isInteger(rating)) {
      errors.push('rating must be an integer');
    } else if (rating < 1 || rating > 5) {
      errors.push('rating must be between 1 and 5');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid review payload',
        errors,
      });
    }

    return {
      providerId,
      rating: rating as number,
      comment,
    };
  }

  private validateUpdatePayload(payload: unknown): UpdateReviewDto {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const rating = body.rating;
    const hasComment = Object.prototype.hasOwnProperty.call(body, 'comment');
    const comment =
      typeof body.comment === 'string' && body.comment.trim().length > 0
        ? body.comment.trim()
        : undefined;
    const errors: string[] = [];

    if (typeof rating !== 'undefined') {
      if (typeof rating !== 'number' || !Number.isInteger(rating)) {
        errors.push('rating must be an integer');
      } else if (rating < 1 || rating > 5) {
        errors.push('rating must be between 1 and 5');
      }
    }

    if (typeof rating === 'undefined' && !hasComment) {
      errors.push('At least one field must be provided');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid review payload',
        errors,
      });
    }

    return {
      ...(typeof rating === 'number' ? { rating } : {}),
      ...(hasComment ? { comment } : {}),
    };
  }

  private ensureUuid(value: string, field: string) {
    if (!isUuid(value)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `${field} must be a valid UUID`,
      });
    }
  }

  private serializeReview(review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
    provider: {
      id: string;
      name: string;
      surname: string;
    };
  }) {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      provider: review.provider,
    };
  }
}