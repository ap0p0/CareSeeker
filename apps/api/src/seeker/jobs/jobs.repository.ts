import { Injectable } from '@nestjs/common';
import type { JobStatus } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateJobDto, UpdateJobDto } from './jobs.dto';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(seekerId: string, data: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        seekerId,
        title: data.title,
        description: data.description,
        location: data.location ?? null,
        scheduledAt: data.scheduledAt ?? null,
        hourlyRateCents: data.hourlyRateCents ?? null,
        status: data.status,
      },
    });
  }

  async listJobs(seekerId: string, statuses?: JobStatus[]) {
    return this.prisma.job.findMany({
      where: {
        seekerId,
        deletedAt: null,
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findJob(seekerId: string, jobId: string) {
    return this.prisma.job.findFirst({
      where: {
        id: jobId,
        seekerId,
        deletedAt: null,
      },
    });
  }

  async updateJob(jobId: string, data: UpdateJobDto) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        ...(typeof data.title === 'string' ? { title: data.title } : {}),
        ...(typeof data.description === 'string'
          ? { description: data.description }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'location')
          ? { location: data.location ?? null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'scheduledAt')
          ? { scheduledAt: data.scheduledAt ?? null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(data, 'hourlyRateCents')
          ? { hourlyRateCents: data.hourlyRateCents ?? null }
          : {}),
        ...(data.status ? { status: data.status } : {}),
      },
    });
  }

  async softDeleteJob(jobId: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    });
  }
}