import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
} from 'jose';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Verifies a Supabase access token.
 *
 * - **HS256 / HS384 / HS512:** uses `SUPABASE_JWT_SECRET` (legacy JWT secret).
 * - **ES256 / RS256 / etc.:** uses JWKS at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
 *   (Supabase “JWT signing keys” / asymmetric tokens).
 *
 * Set `SUPABASE_URL` to `https://<project-ref>.supabase.co` when asymmetric keys are enabled.
 */
export async function verifySupabaseAccessToken(
  token: string,
): Promise<JWTPayload> {
  const secret = process.env['SUPABASE_JWT_SECRET'];
  const supabaseUrl = process.env['SUPABASE_URL']?.trim().replace(/\/+$/, '');

  let headerAlg: string | undefined;
  try {
    headerAlg = decodeProtectedHeader(token).alg;
  } catch {
    throw new UnauthorizedException('Invalid token');
  }

  const useSymmetric =
    headerAlg === 'HS256' || headerAlg === 'HS384' || headerAlg === 'HS512';

  if (useSymmetric) {
    if (!secret) {
      throw new UnauthorizedException('Server auth configuration error');
    }
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
      );
      return payload;
    } catch (err) {
      logVerifyFailure(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  if (!supabaseUrl) {
    throw new UnauthorizedException(
      'Server auth configuration error: set SUPABASE_URL to https://<ref>.supabase.co for asymmetric JWT verification',
    );
  }

  const issuer = `${supabaseUrl}/auth/v1`;
  const jwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
  const JWKS = createRemoteJWKSet(jwksUrl);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience: 'authenticated',
    });
    return payload;
  } catch (err) {
    logVerifyFailure(err);
    throw new UnauthorizedException('Invalid or expired token');
  }
}

function logVerifyFailure(err: unknown): void {
  const on = process.env['AUTH_DEBUG'];
  if (on !== '1' && on !== 'true') return;
  const msg = err instanceof Error ? err.message : String(err);
  console.warn('[auth] JWT verify failed:', msg);
}
