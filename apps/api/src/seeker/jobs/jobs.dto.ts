import type { JobStatus } from '../../../generated/prisma/client.js';

export type CreateJobDto = {
  title: string;
  description: string;
  location?: string;
  scheduledAt?: Date;
  hourlyRateCents?: number;
  status?: JobStatus;
};

export type UpdateJobDto = Partial<CreateJobDto>;
