import { ForbiddenException } from '@nestjs/common';
import type { AuthRequest } from '../auth/auth-types';

export function requireSeekerUser(req: AuthRequest) {
  if (req.user.role !== 'seeker') {
    throw new ForbiddenException(
      'You do not have permission to access the seeker area.',
    );
  }

  return req.user.id;
}