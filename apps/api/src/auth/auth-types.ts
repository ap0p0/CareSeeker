import type { Request } from 'express';

/**
 * Application user context attached to request after auth guard runs.
 * Resolved server-side from DB — frontend MUST NOT infer role from JWT.
 *
 * Why server-side resolution?
 * - JWT is opaque to the client; we do not put role in custom claims.
 * - Role is stored in our DB and can change (e.g. admin promotion).
 * - Frontend uses /me to get current user context; JWT is only for proving identity.
 */
export type AppUser = {
  id: string;
  role: 'seeker' | 'provider' | 'admin';
  providerVerificationStatus: 'pending' | 'approved' | 'rejected' | null;
};

export type AuthRequest = Request & {
  user: AppUser;
};
