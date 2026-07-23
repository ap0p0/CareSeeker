import { Injectable } from '@nestjs/common';
import {
  ProviderVerificationStatus,
  UserRole,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findApprovedProvider(providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: providerId,
        role: UserRole.PROVIDER,
        providerVerificationStatus: ProviderVerificationStatus.APPROVED,
      },
      select: {
        id: true,
      },
    });
  }

  async createMessage(senderId: string, recipientId: string, body: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        recipientId,
        body,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async listVisibleMessages(userId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, senderDeletedAt: null },
          { recipientId: userId, recipientDeletedAt: null },
        ],
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async listConversationMessages(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            recipientId: otherUserId,
            senderDeletedAt: null,
          },
          {
            senderId: otherUserId,
            recipientId: userId,
            recipientDeletedAt: null,
          },
        ],
      },
      orderBy: [{ createdAt: 'asc' }],
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async markConversationAsRead(userId: string, otherUserId: string) {
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: userId,
        recipientDeletedAt: null,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async findVisibleMessage(userId: string, messageId: string) {
    return this.prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: userId, senderDeletedAt: null },
          { recipientId: userId, recipientDeletedAt: null },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async deleteForSender(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { senderDeletedAt: new Date() },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }

  async deleteForRecipient(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { recipientDeletedAt: new Date() },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  }
}