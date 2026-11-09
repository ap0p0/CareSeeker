import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeekerOnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  getStatus(userId: string) {
    return this.prisma.seekersInfo.findUnique({
      where: { userId },
      select: { onboardingCompletedAt: true, profileConfirmedAt: true },
    });
  }

  markCompleted(userId: string, completedAt: Date) {
    return this.prisma.seekersInfo.update({
      where: { userId },
      data: { onboardingCompletedAt: completedAt },
      select: { onboardingCompletedAt: true },
    });
  }

  markConfirmed(userId: string, confirmedAt: Date) {
    return this.prisma.seekersInfo.update({
      where: { userId },
      data: { profileConfirmedAt: confirmedAt },
      select: { profileConfirmedAt: true },
    });
  }
}
