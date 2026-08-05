import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderReviewsService } from './reviews.service';

@Controller('provider/reviews')
@UseGuards(SupabaseJwtGuard)
export class ProviderReviewsController {
  constructor(private readonly reviewsService: ProviderReviewsService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.reviewsService.list(requireProviderUserId(req));
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.reviewsService.create(requireProviderUserId(req), body);
  }

  @Patch(':reviewId')
  update(
    @Req() req: AuthRequest,
    @Param('reviewId') reviewId: string,
    @Body() body: unknown,
  ) {
    return this.reviewsService.update(requireProviderUserId(req), reviewId, body);
  }
}
