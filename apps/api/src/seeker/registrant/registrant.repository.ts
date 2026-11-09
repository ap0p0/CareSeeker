import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateRegistrantPayload } from './registrant.types';

const REGISTRANT_SELECT = {
  name: true,
  surname: true,
  email: true,
  registrantsInfo: {
    select: {
      phone: true,
      relationship: true,
      relationshipOther: true,
      consentConfirmedAt: true,
      updatedAt: true,
    },
  },
} as const;

@Injectable()
export class RegistrantRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** `null` when the account was not opened on behalf of someone else. */
  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: REGISTRANT_SELECT,
    });

    if (!user?.registrantsInfo) return null;
    return { ...user, registrantsInfo: user.registrantsInfo };
  }

  /**
   * Updates identity (`users`) and registrant details (`registrants_info`)
   * together. The caller checks that the registrant row exists first.
   */
  async update(userId: string, data: UpdateRegistrantPayload) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        surname: data.surname,
        registrantsInfo: {
          update: {
            phone: data.phone,
            relationship: data.relationship,
            relationshipOther: data.relationshipOther,
          },
        },
      },
      select: REGISTRANT_SELECT,
    });

    if (!user.registrantsInfo) {
      throw new Error('registrants_info row disappeared during update');
    }
    return { ...user, registrantsInfo: user.registrantsInfo };
  }
}
