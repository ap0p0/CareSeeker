import { Injectable } from '@nestjs/common';
import {
  ProviderVerificationStatus,
  UserRole,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateReviewDto, UpdateReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findApprovedProvider(providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: providerId,
        role: UserRole.PROVIDER,
        providerVerificationStatus: ProviderVerificationStatus.APPROVED,
      },
      select: {
        id: true,
      },
    });
  }

  async createReview(seekerId: string, data: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        seekerId,
        providerId: data.providerId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async findReview(seekerId: string, reviewId: string) {
    return this.prisma.review.findFirst({
      where: {
        id: reviewId,
        seekerId,
        deletedAt: null,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async updateReview(reviewId: string, data: UpdateReviewDto) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(typeof data.rating === 'number' ? { rating: data.rating } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'comment')
          ? { comment: data.comment ?? null }
          : {}),
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async listReviews(seekerId: string) {
    return this.prisma.review.findMany({
      where: {
        seekerId,
        deletedAt: null,
      },
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async aggregateReviewStats(providerId: string) {
    const [aggregate, distribution] = await Promise.all([
      this.prisma.review.aggregate({
        where: {
          providerId,
          deletedAt: null,
        },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: {
          providerId,
          deletedAt: null,
        },
        _count: { _all: true },
      }),
    ]);

    return { aggregate, distribution };
  }
}