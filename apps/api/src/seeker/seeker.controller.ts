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
import { SeekerService } from './seeker.service';

/**
 * Seeker-only endpoints.
 *
 * `GET /seeker/me` is the source of truth for whether the current
 * Supabase-authenticated user may use the client (care seeker) app.
 *
 * The auth guard verifies identity and ensures an application user exists;
 * this means first-time authenticated users are created in our DB with the
 * default SEEKER role before this controller checks authorization.
 */
@Controller('seeker')
export class SeekerController {
  constructor(private readonly seekerService: SeekerService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: unknown) {
    const user = await this.seekerService.register(body);

    return {
      success: true,
      message: 'Care seeker account created successfully',
      data: user,
    };
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  seekerMe(@Req() req: AuthRequest) {
    if (req.user.role !== 'seeker') {
      throw new ForbiddenException(
        'You do not have permission to access the seeker area.',
      );
    }

    return req.user;
  }
}
