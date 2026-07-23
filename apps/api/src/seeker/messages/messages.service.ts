import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ensureObject, isUuid } from '../seeker.validation';
import type { CreateMessageDto } from './messages.dto';
import { MessagesRepository } from './messages.repository';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  async createMessage(seekerId: string, body: unknown) {
    const payload = this.validateCreatePayload(body);

    const provider = await this.messagesRepository.findApprovedProvider(
      payload.recipientId,
    );
    if (!provider) {
      throw new NotFoundException({
        code: 'PROVIDER_NOT_FOUND',
        message: 'Approved provider not found',
      });
    }

    const message = await this.messagesRepository.createMessage(
      seekerId,
      payload.recipientId,
      payload.body,
    );

    return this.serializeMessage(message);
  }

  async listConversations(seekerId: string) {
    const messages = await this.messagesRepository.listVisibleMessages(seekerId);
    const conversations = new Map<
      string,
      {
        otherUser: {
          id: string;
          name: string;
          surname: string;
        };
        lastMessage: ReturnType<MessagesService['serializeMessage']>;
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const otherUser =
        message.senderId === seekerId ? message.recipient : message.sender;
      const unreadIncrement =
        message.recipientId === seekerId && !message.readAt ? 1 : 0;

      const existing = conversations.get(otherUser.id);
      if (!existing) {
        conversations.set(otherUser.id, {
          otherUser,
          lastMessage: this.serializeMessage(message),
          unreadCount: unreadIncrement,
        });
        continue;
      }

      existing.unreadCount += unreadIncrement;
    }

    return Array.from(conversations.values()).sort(
      (left, right) =>
        right.lastMessage.createdAt.getTime() - left.lastMessage.createdAt.getTime(),
    );
  }

  async getMessages(seekerId: string, otherUserId: string) {
    this.ensureUuid(otherUserId, 'otherUserId');
    await this.messagesRepository.markConversationAsRead(seekerId, otherUserId);

    const messages = await this.messagesRepository.listConversationMessages(
      seekerId,
      otherUserId,
    );

    return messages.map((message) => this.serializeMessage(message));
  }

  async deleteMessage(seekerId: string, messageId: string) {
    this.ensureUuid(messageId, 'messageId');
    const message = await this.messagesRepository.findVisibleMessage(
      seekerId,
      messageId,
    );

    if (!message) {
      throw new NotFoundException({
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message not found',
      });
    }

    const deleted =
      message.senderId === seekerId
        ? await this.messagesRepository.deleteForSender(messageId)
        : await this.messagesRepository.deleteForRecipient(messageId);

    return this.serializeMessage(deleted);
  }

  private validateCreatePayload(payload: unknown): CreateMessageDto {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const recipientId =
      typeof body.recipientId === 'string' ? body.recipientId.trim() : '';
    const messageBody = typeof body.body === 'string' ? body.body.trim() : '';
    const errors: string[] = [];

    if (!recipientId) {
      errors.push('recipientId is required');
    } else if (!isUuid(recipientId)) {
      errors.push('recipientId must be a valid UUID');
    }

    if (!messageBody) {
      errors.push('body is required');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid message payload',
        errors,
      });
    }

    return {
      recipientId,
      body: messageBody,
    };
  }

  private ensureUuid(value: string, field: string) {
    if (!isUuid(value)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `${field} must be a valid UUID`,
      });
    }
  }

  private serializeMessage(message: {
    id: string;
    senderId: string;
    recipientId: string;
    body: string;
    readAt: Date | null;
    senderDeletedAt: Date | null;
    recipientDeletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    sender: {
      id: string;
      name: string;
      surname: string;
    };
    recipient: {
      id: string;
      name: string;
      surname: string;
    };
  }) {
    return {
      id: message.id,
      body: message.body,
      readAt: message.readAt,
      senderDeletedAt: message.senderDeletedAt,
      recipientDeletedAt: message.recipientDeletedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sender: message.sender,
      recipient: message.recipient,
    };
  }
}