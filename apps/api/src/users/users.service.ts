import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JWTPayload } from 'jose';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateFromJwt(payload: JWTPayload) {
    const supabaseId = payload.sub;
    const email = (payload as Record<string, unknown>).email as
      | string
      | undefined;

    if (!supabaseId || !email) {
      throw new Error('Invalid Supabase token payload');
    }

    return this.prisma.user.upsert({
      where: { supabaseId },
      update: {},
      create: {
        supabaseId,
        email,
      },
    });
  }
}
