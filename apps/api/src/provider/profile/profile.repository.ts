import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProviderProfilePayload } from './profile.types';

const providerProfileInclude = {
  providersInfo: true,
} satisfies Prisma.UserInclude;

export type ProviderProfileRecord = Prisma.UserGetPayload<{
  include: typeof providerProfileInclude;
}>;

@Injectable()
export class ProviderProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<ProviderProfileRecord | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.PROVIDER,
      },
      include: providerProfileInclude,
    });
  }

  /**
   * Applies identity fields to `users` and personal fields to `providers_info`.
   *
   * `hasPersonalInfo` tells whether a `providers_info` row already exists. When
   * it does not (accounts that predate onboarding step 1) the service guarantees
   * the payload is complete, so the row is created instead of updated.
   */
  updateByUserId(
    userId: string,
    payload: UpdateProviderProfilePayload,
    options: { hasPersonalInfo: boolean },
  ): Promise<ProviderProfileRecord> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.surname !== undefined ? { surname: payload.surname } : {}),
        ...this.buildPersonalInfoWrite(payload, options.hasPersonalInfo),
      },
      include: providerProfileInclude,
    });
  }

  private buildPersonalInfoWrite(
    payload: UpdateProviderProfilePayload,
    hasPersonalInfo: boolean,
  ): Pick<Prisma.UserUpdateInput, 'providersInfo'> {
    const update: Prisma.ProvidersInfoUpdateWithoutUserInput = {
      ...(payload.dateOfBirth !== undefined
        ? { dateOfBirth: payload.dateOfBirth }
        : {}),
      ...(payload.gender !== undefined ? { gender: payload.gender } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
      ...(payload.address ?? {}),
    };

    if (Object.keys(update).length === 0) {
      return {};
    }

    if (hasPersonalInfo) {
      return { providersInfo: { update } };
    }

    if (!payload.dateOfBirth || !payload.phone || !payload.address) {
      throw new Error(
        'Creating providers_info requires dateOfBirth, phone and address',
      );
    }

    const create: Prisma.ProvidersInfoCreateWithoutUserInput = {
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender ?? null,
      phone: payload.phone,
      ...payload.address,
    };

    return { providersInfo: { create } };
  }

  updateProfileImagePath(
    userId: string,
    profileImagePath: string,
  ): Promise<ProviderProfileRecord> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        providersInfo: {
          update: { profileImagePath },
        },
      },
      include: providerProfileInclude,
    });
  }
}
