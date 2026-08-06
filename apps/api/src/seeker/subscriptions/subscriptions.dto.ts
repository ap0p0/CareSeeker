export type SubscriptionInfoDto = {
  id: string;
  planName: string;
  status: string;
  startedAt: Date | null;
  renewsAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentRecordDto = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
