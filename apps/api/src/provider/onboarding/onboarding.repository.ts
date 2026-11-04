import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderOnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(userId: string) {
    const [info, serviceProfile, documentsCount, workPreferences] =
      await Promise.all([
        this.prisma.providersInfo.findUnique({
          where: { userId },
          select: { onboardingCompletedAt: true, profileConfirmedAt: true },
        }),
        this.prisma.providerServiceProfile.findUnique({
          where: { userId },
          select: { id: true },
        }),
        this.prisma.providerDocument.count({
          where: { providerId: userId, deletedAt: null },
        }),
        this.prisma.providerWorkPreferences.findUnique({
          where: { userId },
          select: { id: true },
        }),
      ]);

    return {
      personalInfo: info !== null,
      completedAt: info?.onboardingCompletedAt ?? null,
      profileConfirmedAt: info?.profileConfirmedAt ?? null,
      serviceProfile: serviceProfile !== null,
      documentsCount,
      workPreferences: workPreferences !== null,
    };
  }

  markConfirmed(userId: string, confirmedAt: Date) {
    return this.prisma.providersInfo.update({
      where: { userId },
      data: { profileConfirmedAt: confirmedAt },
      select: { profileConfirmedAt: true },
    });
  }

  markCompleted(userId: string, completedAt: Date) {
    return this.prisma.providersInfo.update({
      where: { userId },
      data: { onboardingCompletedAt: completedAt },
      select: { onboardingCompletedAt: true },
    });
  }
}
