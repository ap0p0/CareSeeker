import { Injectable } from '@nestjs/common';
import {
  PaymentStatus,
  SubscriptionStatus,
} from '../../../generated/prisma/client.js';
import { lowerCaseEnum } from '../seeker.validation';
import { SubscriptionsRepository } from './subscriptions.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async getSubscription(userId: string) {
    const subscription =
      await this.subscriptionsRepository.getSubscription(userId);
    return subscription ? this.serializeSubscription(subscription) : null;
  }

  async getSubscriptionStatus(userId: string) {
    const subscription =
      await this.subscriptionsRepository.getSubscription(userId);

    return {
      status: lowerCaseEnum(
        subscription?.status ?? SubscriptionStatus.INACTIVE,
      ),
    };
  }

  async listPayments(userId: string) {
    const payments = await this.subscriptionsRepository.listPayments(userId);
    return payments.map((payment) => this.serializePayment(payment));
  }

  private serializeSubscription(subscription: {
    id: string;
    planName: string;
    status: SubscriptionStatus;
    startedAt: Date | null;
    renewsAt: Date | null;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: subscription.id,
      planName: subscription.planName,
      status: lowerCaseEnum(subscription.status),
      startedAt: subscription.startedAt,
      renewsAt: subscription.renewsAt,
      canceledAt: subscription.canceledAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  private serializePayment(payment: {
    id: string;
    amountCents: number;
    currency: string;
    status: PaymentStatus;
    description: string | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: payment.id,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: lowerCaseEnum(payment.status),
      description: payment.description,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
