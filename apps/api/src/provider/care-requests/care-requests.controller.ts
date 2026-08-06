import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import { requireProviderUserId } from '../common/provider-auth';
import { ProviderCareRequestsService } from './care-requests.service';

@Controller('provider/care-requests')
@UseGuards(SupabaseJwtGuard)
export class ProviderCareRequestsController {
  constructor(
    private readonly careRequestsService: ProviderCareRequestsService,
  ) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.careRequestsService.list(requireProviderUserId(req));
  }

  @Patch(':requestId/accept')
  accept(@Req() req: AuthRequest, @Param('requestId') requestId: string) {
    return this.careRequestsService.accept(
      requireProviderUserId(req),
      requestId,
    );
  }

  @Patch(':requestId/reject')
  reject(@Req() req: AuthRequest, @Param('requestId') requestId: string) {
    return this.careRequestsService.reject(
      requireProviderUserId(req),
      requestId,
    );
  }

  @Patch(':requestId/status')
  updateStatus(
    @Req() req: AuthRequest,
    @Param('requestId') requestId: string,
    @Body() body: unknown,
  ) {
    const status =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>).status
        : undefined;

    return this.careRequestsService.updateStatus(
      requireProviderUserId(req),
      requestId,
      status,
    );
  }
}
