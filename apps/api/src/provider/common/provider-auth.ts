import { ForbiddenException } from '@nestjs/common';
import type { AuthRequest } from '../../auth/auth-types';

export function requireProviderUserId(req: AuthRequest): string {
  if (req.user.role !== 'provider') {
    throw new ForbiddenException(
      'You do not have permission to access the provider area.',
    );
  }

  return req.user.id;
}
