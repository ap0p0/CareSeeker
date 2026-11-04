import { ForbiddenException } from '@nestjs/common';
import type { AuthRequest } from '../auth/auth-types';

export function requireAdminUserId(req: AuthRequest): string {
  if (req.user.role !== 'admin') {
    throw new ForbiddenException(
      'You do not have permission to access the admin area.',
    );
  }

  return req.user.id;
}
