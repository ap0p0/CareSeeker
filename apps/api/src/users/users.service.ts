import { Injectable } from '@nestjs/common';
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

  private buildDefaultSeekerData(supabaseId: string, email?: string) {
    const username = `u_${supabaseId.replace(/-/g, '')}`;

    return {
      id: supabaseId,
      email: email ?? `user-${supabaseId}@placeholder.local`,
      username,
      name: 'Unknown',
      surname: 'User',
      role: UserRole.SEEKER,
    };
  }

  async createDefaultSeekerUser(supabaseId: string, email?: string) {
    return this.prisma.user.create({
      data: this.buildDefaultSeekerData(supabaseId, email),
    });
  }

  private buildDefaultProviderData(supabaseId: string, email?: string) {
    const username = `u_${supabaseId.replace(/-/g, '')}`;

    return {
      id: supabaseId,
      email: email ?? `user-${supabaseId}@placeholder.local`,
      username,
      name: 'Unknown',
      surname: 'User',
      role: UserRole.PROVIDER,
      providerVerificationStatus: ProviderVerificationStatus.PENDING,
    };
  }

  async createDefaultProviderUser(supabaseId: string, email?: string) {
    return this.prisma.user.create({
      data: this.buildDefaultProviderData(supabaseId, email),
    });
  }

  /**
   * Find user by Supabase id, or create with default role SEEKER.
   * Admin is never assigned on create.
   */
  async findOrCreateFromSupabase(supabaseId: string, email?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id: supabaseId },
    });
    if (existing) return existing;

    return this.createDefaultSeekerUser(supabaseId, email);
  }
}
