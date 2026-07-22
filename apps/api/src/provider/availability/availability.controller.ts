import {
  Body,
  Controller,
  Delete,
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
import { ProviderAvailabilityService } from './availability.service';

@Controller('provider/availability')
@UseGuards(SupabaseJwtGuard)
export class ProviderAvailabilityController {
  constructor(private readonly availabilityService: ProviderAvailabilityService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.availabilityService.list(requireProviderUserId(req));
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() body: unknown) {
    return this.availabilityService.create(requireProviderUserId(req), body);
  }

  @Patch(':availabilityId')
  update(
    @Req() req: AuthRequest,
    @Param('availabilityId') availabilityId: string,
    @Body() body: unknown,
  ) {
    return this.availabilityService.update(
      requireProviderUserId(req),
      availabilityId,
      body,
    );
  }

  @Delete(':availabilityId')
  remove(@Req() req: AuthRequest, @Param('availabilityId') availabilityId: string) {
    return this.availabilityService.remove(requireProviderUserId(req), availabilityId);
  }
}
