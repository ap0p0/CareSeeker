import { Injectable } from '@nestjs/common';
import {
  JobStatus,
  ProviderVerificationStatus,
  UserRole,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeekerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const [activeJobs, savedProvidersCount, notificationsCount] =
      await Promise.all([
        this.prisma.job.count({
          where: {
            seekerId: userId,
            deletedAt: null,
            status: { in: [JobStatus.OPEN, JobStatus.IN_PROGRESS] },
          },
        }),
        this.prisma.savedProvider.count({
          where: { seekerId: userId },
        }),
        this.prisma.notification.count({
          where: {
            userId,
            deletedAt: null,
            readAt: null,
          },
        }),
      ]);

    const [recentJobs, recentNotifications, recentMessages, recentPayments] =
      await Promise.all([
        this.prisma.job.findMany({
          where: { seekerId: userId, deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
          },
        }),
        this.prisma.notification.findMany({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
          },
        }),
        this.prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId, senderDeletedAt: null },
              { recipientId: userId, recipientDeletedAt: null },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            body: true,
            createdAt: true,
          },
        }),
        this.prisma.payment.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            amountCents: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      activeJobs,
      savedProvidersCount,
      notificationsCount,
      recentJobs,
      recentNotifications,
      recentMessages,
      recentPayments,
    };
  }

  async listHistory(userId: string) {
    return this.prisma.job.findMany({
      where: {
        seekerId: userId,
        OR: [
          { status: { in: [JobStatus.COMPLETED, JobStatus.CANCELLED] } },
          { deletedAt: { not: null } },
        ],
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async listExploreProviders(search?: string) {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.PROVIDER,
        providerVerificationStatus: ProviderVerificationStatus.APPROVED,
        ...(search
          ? {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { surname: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ name: 'asc' }, { surname: 'asc' }, { username: 'asc' }],
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        providerVerificationStatus: true,
      },
    });
  }

  async getAccount(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        surname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAccount(
    userId: string,
    data: { name?: string; surname?: string; username?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        surname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}