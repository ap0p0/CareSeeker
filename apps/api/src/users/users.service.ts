import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProviderVerificationStatus,
  UserRole,
} from '../../generated/prisma/client.js';

/**
 * Application user service. Handles user creation and lookup.
 *
 * Admin role is NEVER self-assignable: we default new users to SEEKER.
 * Only existing admins (or migrations) can set role = ADMIN.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private requireAuthIdentity(supabaseId: string, email: string) {
    const id = typeof supabaseId === 'string' ? supabaseId.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';

    if (!id) {
      throw new BadRequestException({
        code: 'MISSING_SUPABASE_ID',
        message: 'Supabase user id is required to create an account',
      });
    }

    if (!normalizedEmail) {
      throw new BadRequestException({
        code: 'MISSING_EMAIL',
        message: 'Email is required to create an account',
      });
    }

    return {
      supabaseId: id,
      email: normalizedEmail.toLowerCase(),
    };
  }

  private buildDefaultSeekerData(supabaseId: string, email: string) {
    const identity = this.requireAuthIdentity(supabaseId, email);
    const username = `u_${identity.supabaseId.replace(/-/g, '')}`;

    return {
      id: identity.supabaseId,
      email: identity.email,
      username,
      name: 'Unknown',
      surname: 'User',
      role: UserRole.SEEKER,
    };
  }

  async createDefaultSeekerUser(supabaseId: string, email: string) {
    return this.prisma.user.create({
      data: this.buildDefaultSeekerData(supabaseId, email),
    });
  }

  private buildDefaultProviderData(supabaseId: string, email: string) {
    const identity = this.requireAuthIdentity(supabaseId, email);
    const username = `u_${identity.supabaseId.replace(/-/g, '')}`;

    return {
      id: identity.supabaseId,
      email: identity.email,
      username,
      name: 'Unknown',
      surname: 'User',
      role: UserRole.PROVIDER,
      providerVerificationStatus: ProviderVerificationStatus.PENDING,
    };
  }

  async createDefaultProviderUser(supabaseId: string, email: string) {
    return this.prisma.user.create({
      data: this.buildDefaultProviderData(supabaseId, email),
    });
  }

  /**
   * Find user by Supabase id, or create with default role SEEKER.
   * Admin is never assigned on create.
   * Creating a new row requires both supabase id and email (no placeholders).
   */
  async findOrCreateFromSupabase(supabaseId: string, email?: string) {
    const id = typeof supabaseId === 'string' ? supabaseId.trim() : '';
    if (!id) {
      throw new BadRequestException({
        code: 'MISSING_SUPABASE_ID',
        message: 'Supabase user id is required',
      });
    }

    const existing = await this.prisma.user.findUnique({
      where: { id },
    });
    if (existing) return existing;

    if (!email?.trim()) {
      throw new BadRequestException({
        code: 'MISSING_EMAIL',
        message: 'Email is required to create an account',
      });
    }

    return this.createDefaultSeekerUser(id, email);
  }
}
