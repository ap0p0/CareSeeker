import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { AuthRequest } from '../auth/auth-types';
import { ProviderService } from './provider.service';

/**
 * Provider-only endpoints.
 *
 * `GET /provider/me` is the source of truth for whether the current
 * Supabase-authenticated user may use the provider app.
 */
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: unknown) {
    const user = await this.providerService.register(body);

    return {
      success: true,
      message: 'Care provider account created successfully',
      data: user,
    };
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  providerMe(@Req() req: AuthRequest) {
    if (req.user.role !== 'provider') {
      throw new ForbiddenException(
        'You do not have permission to access the provider area.',
      );
    }

    return req.user;
  }
}
