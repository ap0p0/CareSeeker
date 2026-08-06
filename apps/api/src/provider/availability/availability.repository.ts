import { Injectable } from '@nestjs/common';
import type {
  AvailabilityPayload,
  AvailabilityUpdatePayload,
} from './availability.types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderAvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByProviderId(providerId: string) {
    return this.prisma.providerAvailability.findMany({
      where: { providerId },
      orderBy: [{ dayOfWeek: 'asc' }, { date: 'asc' }, { startTime: 'asc' }],
    });
  }

  create(providerId: string, payload: AvailabilityPayload) {
    return this.prisma.providerAvailability.create({
      data: {
        providerId,
        dayOfWeek: payload.dayOfWeek,
        date: payload.date ? new Date(payload.date) : null,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    });
  }

  update(providerId: string, id: string, payload: AvailabilityUpdatePayload) {
    return this.prisma.providerAvailability.updateMany({
      where: { id, providerId },
      data: {
        dayOfWeek: payload.dayOfWeek,
        date:
          typeof payload.date === 'string'
            ? new Date(payload.date)
            : payload.date === undefined
              ? undefined
              : null,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    });
  }

  delete(providerId: string, id: string) {
    return this.prisma.providerAvailability.deleteMany({
      where: { id, providerId },
    });
  }
}
