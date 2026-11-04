import { Injectable } from '@nestjs/common';
import {
  AvailabilityWindowKind,
  DayAvailabilityMode,
  Prisma,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { ProviderWorkPreferencesInput } from './work-preferences.types';

const workPreferencesSelect = {
  providerWorkPreferences: true,
  providerWorkingDays: { orderBy: { dayOfWeek: 'asc' } },
  providerAvailabilities: {
    // Weekly schedule only; one-off date entries belong to /provider/availability.
    where: { dayOfWeek: { not: null }, date: null },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    select: {
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      endsNextDay: true,
      kind: true,
    },
  },
} satisfies Prisma.UserSelect;

export type ProviderWorkPreferencesRecord = Prisma.UserGetPayload<{
  select: typeof workPreferencesSelect;
}>;

@Injectable()
export class ProviderWorkPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<ProviderWorkPreferencesRecord | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: workPreferencesSelect,
    });
  }

  /**
   * Creates or fully replaces step 4 in one transaction: the preferences row
   * is upserted and the weekly schedule (working days + weekly windows) is
   * rewritten. Date-specific availability entries are left untouched.
   */
  async replaceByUserId(
    userId: string,
    input: ProviderWorkPreferencesInput,
  ): Promise<ProviderWorkPreferencesRecord> {
    const { workingDays, ...preferences } = input;

    return this.prisma.$transaction(async (tx) => {
      await tx.providerWorkPreferences.upsert({
        where: { userId },
        create: { userId, ...preferences },
        update: preferences,
      });

      await tx.providerWorkingDay.deleteMany({ where: { providerId: userId } });
      await tx.providerAvailability.deleteMany({
        where: { providerId: userId, dayOfWeek: { not: null }, date: null },
      });

      await tx.providerWorkingDay.createMany({
        data: workingDays.map((day) => ({
          providerId: userId,
          dayOfWeek: day.dayOfWeek,
          mode: day.mode,
        })),
      });

      const windows = workingDays.flatMap((day) =>
        day.windows.map((window) => ({
          providerId: userId,
          dayOfWeek: day.dayOfWeek,
          startTime: window.start,
          endTime: window.end,
          endsNextDay: window.endsNextDay,
          kind:
            day.mode === DayAvailabilityMode.BLOCKED_WINDOWS
              ? AvailabilityWindowKind.BLOCKED
              : AvailabilityWindowKind.AVAILABLE,
        })),
      );
      if (windows.length > 0) {
        await tx.providerAvailability.createMany({ data: windows });
      }

      const record = await tx.user.findUnique({
        where: { id: userId },
        select: workPreferencesSelect,
      });
      if (!record) {
        throw new Error(
          'Provider user disappeared during work preferences update',
        );
      }
      return record;
    });
  }
}
