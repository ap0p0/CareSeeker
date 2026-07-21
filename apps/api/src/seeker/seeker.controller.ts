import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { AuthRequest } from '../auth/auth-types';
import { requireSeekerUser } from './require-seeker';
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
    requireSeekerUser(req);
    return req.user;
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('overview')
  async overview(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.seekerService.getOverview(seekerId);
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('history')
  async history(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.seekerService.listHistory(seekerId);
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('explore')
  async explore(
    @Req() req: AuthRequest,
    @Query() query: Record<string, unknown>,
  ) {
    requireSeekerUser(req);
    return this.seekerService.listExploreProviders(query);
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('account')
  async account(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.seekerService.getAccount(seekerId);
  }

  @UseGuards(SupabaseJwtGuard)
  @Patch('account')
  async updateAccount(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    const account = await this.seekerService.updateAccount(seekerId, body);

    return {
      success: true,
      message: 'Account updated successfully',
      data: account,
    };
  }
}
