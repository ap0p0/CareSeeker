import type { Request } from 'express';
import type { JWTPayload } from 'jose';

export type AuthRequest = Request & {
  user: JWTPayload;
};
