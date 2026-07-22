import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateReviewPayload, UpdateReviewPayload } from './reviews.types';

@Injectable()
export class ProviderReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByProviderUserId(providerUserId: string) {
    return this.prisma.review.findMany({
      where: {
        providerId: providerUserId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(providerUserId: string, payload: CreateReviewPayload) {
    return this.prisma.review.create({
      data: {
        providerId: providerUserId,
        careSeekerId: payload.careSeekerId,
        rating: payload.rating,
        comment: payload.comment ?? null,
      },
    });
  }

  update(providerUserId: string, reviewId: string, payload: UpdateReviewPayload) {
    return this.prisma.review.updateMany({
      where: {
        id: reviewId,
        providerId: providerUserId,
        deletedAt: null,
      },
      data: {
        rating: payload.rating,
        comment: payload.comment,
      },
    });
  }
}
