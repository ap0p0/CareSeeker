import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CareForType,
  type Gender,
  ProviderVerificationStatus,
  type RegistrantRelationship,
  UserRole,
} from '../../generated/prisma/client.js';

/**
 * Provider onboarding step 1 data. Identity fields go on `users`; the rest on
 * the 1:1 `providers_info` row created in the same transaction.
 */
export type CreateProviderUserProfile = {
  name: string;
  surname: string;
  personalInfo: {
    dateOfBirth: Date;
    gender: Gender | null;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    profileImagePath: string | null;
  };
};

/**
 * Step 1 of a seeker registration made on behalf of someone else. Identity
 * fields go on `users`; the registrant-specific details on the 1:1
 * `registrants_info` row created in the same transaction.
 */
export type CreateSeekerOnBehalfUserProfile = {
  name: string;
  surname: string;
  registrantInfo: {
    phone: string;
    relationship: RegistrantRelationship;
    relationshipOther: string | null;
    consentConfirmedAt: Date;
  };
};

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

    return {
      id: identity.supabaseId,
      email: identity.email,
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

  async createSeekerUser(
    supabaseId: string,
    email: string,
    profile: {
      name: string;
      surname: string;
    },
  ) {
    const identity = this.requireAuthIdentity(supabaseId, email);

    return this.prisma.user.create({
      data: {
        id: identity.supabaseId,
        email: identity.email,
        name: profile.name,
        surname: profile.surname,
        role: UserRole.SEEKER,
        seekersInfo: {
          create: {
            careFor: CareForType.SELF,
          },
        },
      },
      include: {
        seekersInfo: true,
      },
    });
  }

  /**
   * Creates the `User` row for a seeker registering on behalf of someone else
   * together with its `seekers_info` (`careFor = OTHER`) and
   * `registrants_info` rows in a single nested write, so the account can never
   * exist without the registrant details that justify it.
   */
  async createSeekerOnBehalfUser(
    supabaseId: string,
    email: string,
    profile: CreateSeekerOnBehalfUserProfile,
  ) {
    const identity = this.requireAuthIdentity(supabaseId, email);

    return this.prisma.user.create({
      data: {
        id: identity.supabaseId,
        email: identity.email,
        name: profile.name,
        surname: profile.surname,
        role: UserRole.SEEKER,
        seekersInfo: {
          create: {
            careFor: CareForType.OTHER,
          },
        },
        registrantsInfo: {
          create: profile.registrantInfo,
        },
      },
      include: {
        seekersInfo: true,
        registrantsInfo: true,
      },
    });
  }

  /**
   * Creates the provider `User` row together with its `providers_info` row in
   * a single nested write, so authentication identity and personal data can
   * never end up half-saved.
   */
  async createProviderUser(
    supabaseId: string,
    email: string,
    profile: CreateProviderUserProfile,
  ) {
    const identity = this.requireAuthIdentity(supabaseId, email);

    return this.prisma.user.create({
      data: {
        id: identity.supabaseId,
        email: identity.email,
        name: profile.name,
        surname: profile.surname,
        role: UserRole.PROVIDER,
        providerVerificationStatus: ProviderVerificationStatus.PENDING,
        providersInfo: {
          create: profile.personalInfo,
        },
      },
      include: {
        providersInfo: true,
      },
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
