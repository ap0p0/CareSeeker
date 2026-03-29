import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type Request } from 'express';
import { UsersService } from '../users/users.service';
import type { AppUser, AuthRequest } from './auth-types';
import { verifySupabaseAccessToken } from './verify-supabase-jwt';

/**
 * Auth guard that:
 * 1. Reads Authorization: Bearer <supabase_access_token>
 * 2. Verifies the token (HS* via JWT secret, asymmetric via JWKS + SUPABASE_URL)
 * 3. Extracts sub → Supabase user ID
 * 4. Loads application user from DB (creates with default role SEEKER if new)
 * 5. Attaches req.user = AppUser
 *
 * Role is resolved server-side. Frontend must not infer role from JWT;
 * it should call GET /me after auth to get application user context.
 *
 * **401** here means the token could not be verified (wrong secret, wrong project URL,
 * expired token). **403** on `/admin/me` means the token was valid but `User.role` ≠ admin.
 *
 * Database errors after a successful JWT verify are **not** turned into 401 (they surface as 500).
 */
@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    let payload: Awaited<ReturnType<typeof verifySupabaseAccessToken>>;
    try {
      payload = await verifySupabaseAccessToken(token);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }

    const supabaseId = payload.sub;
    if (!supabaseId || typeof supabaseId !== 'string') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const email = (payload as Record<string, unknown>).email as
      | string
      | undefined;

    const dbUser = await this.usersService.findOrCreateFromSupabase(
      supabaseId,
      email,
    );

    const appUser: AppUser = {
      id: dbUser.id,
      role: dbUser.role.toLowerCase() as AppUser['role'],
      providerVerificationStatus: dbUser.providerVerificationStatus
        ? (dbUser.providerVerificationStatus.toLowerCase() as AppUser['providerVerificationStatus'])
        : null,
    };

    (request as AuthRequest).user = appUser;
    return true;
  }
}
