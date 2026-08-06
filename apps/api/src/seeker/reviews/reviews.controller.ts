import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { ReviewsService } from './reviews.service';

@Controller('seeker/reviews')
@UseGuards(SupabaseJwtGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    const review = await this.reviewsService.createReview(seekerId, body);

    return {
      success: true,
      message: 'Review created successfully',
      data: review,
    };
  }

  @Patch(':reviewId')
  async updateReview(
    @Req() req: AuthRequest,
    @Param('reviewId') reviewId: string,
    @Body() body: unknown,
  ) {
    const seekerId = requireSeekerUser(req);
    const review = await this.reviewsService.updateReview(
      seekerId,
      reviewId,
      body,
    );

    return {
      success: true,
      message: 'Review updated successfully',
      data: review,
    };
  }

  @Get()
  async listReviews(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.reviewsService.listReviews(seekerId);
  }

  @Get('stats/:providerId')
  async getRatingStatistics(@Param('providerId') providerId: string) {
    return this.reviewsService.getRatingStatistics(providerId);
  }
}
