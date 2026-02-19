import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from './auth/supabase-jwt.guard';
import type { AuthRequest } from './auth/auth-types';

/**
 * GET /me — returns application user context.
 *
 * Requires: Authorization: Bearer <supabase_access_token>
 *
 * Frontend usage:
 * 1. User signs in with Supabase Auth (client-side).
 * 2. Frontend stores the access_token.
 * 3. Frontend calls GET /me with header: Authorization: Bearer <token>
 * 4. Backend validates token, loads app user, returns context.
 *
 * Response shape (documented for frontend):
 * {
 *   "id": "uuid",           // Supabase auth.users.id
 *   "role": "seeker" | "provider" | "admin",
 *   "providerVerificationStatus": "pending" | "approved" | "rejected" | null
 * }
 */
@Controller()
export class AppController {
  @Get('health')
  health() {
    return { ok: true };
  }

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  me(@Req() req: AuthRequest) {
    return req.user;
  }
}
