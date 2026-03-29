import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { AuthRequest } from '../auth/auth-types';

/**
 * Admin-only endpoints.
 *
 * **Authorization:** `GET /admin/me` is the source of truth for whether the current
 * Supabase-authenticated user may use the admin app. The frontend must not treat
 * “has a session” or “separate subdomain” as sufficient — it always validates here.
 *
 * Identity is proven by `SupabaseJwtGuard`; application role comes from the DB.
 * Response shape matches `GET /me` for admins; non-admins receive 403 (401 for bad/missing token).
 */
@Controller('admin')
export class AdminController {
  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  adminMe(@Req() req: AuthRequest) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to access the admin area.',
      );
    }
    return req.user;
  }
}
