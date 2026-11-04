import { UnauthorizedException } from '@nestjs/common';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { getLocalAuthJwtSecret } from '../auth-mode';

/**
 * Access tokens for `AUTH_MODE=local`. Same claims the guard reads from a
 * Supabase token (`sub`, `email`), signed HS256 with `LOCAL_AUTH_JWT_SECRET`.
 */
export const LOCAL_AUTH_ISSUER = 'careseeker-local-auth';
export const LOCAL_AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 12;

const secretKey = () => new TextEncoder().encode(getLocalAuthJwtSecret());

export async function signLocalAccessToken(user: {
  id: string;
  email: string;
}): Promise<{ accessToken: string; expiresAt: number }> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + LOCAL_AUTH_TOKEN_TTL_SECONDS;

  const accessToken = await new SignJWT({
    email: user.email,
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer(LOCAL_AUTH_ISSUER)
    .setAudience('authenticated')
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(secretKey());

  return { accessToken, expiresAt };
}

export async function verifyLocalAccessToken(
  token: string,
): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: LOCAL_AUTH_ISSUER,
      audience: 'authenticated',
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}
