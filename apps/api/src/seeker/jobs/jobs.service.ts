import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '../../../generated/prisma/client.js';
import {
  ensureObject,
  isUuid,
  lowerCaseEnum,
  readOptionalDate,
  readOptionalEnum,
  readOptionalInteger,
  readOptionalString,
  readRequiredString,
} from '../seeker.validation';
import type { CreateJobDto, UpdateJobDto } from './jobs.dto';
import { JobsRepository } from './jobs.repository';

const JOB_STATUSES = [
  JobStatus.OPEN,
  JobStatus.IN_PROGRESS,
  JobStatus.COMPLETED,
  JobStatus.CANCELLED,
] as const;

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  async createJob(seekerId: string, body: unknown) {
    const payload = this.validateCreatePayload(body);
    const job = await this.jobsRepository.createJob(seekerId, payload);
    return this.serializeJob(job);
  }

  async listJobs(seekerId: string) {
    const jobs = await this.jobsRepository.listJobs(seekerId, [
      JobStatus.OPEN,
      JobStatus.IN_PROGRESS,
    ]);

    return jobs.map((job) => this.serializeJob(job));
  }

  async getJob(seekerId: string, jobId: string) {
    this.ensureUuid(jobId, 'jobId');

    const job = await this.jobsRepository.findJob(seekerId, jobId);
    if (!job) {
      throw new NotFoundException({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      });
    }

    return this.serializeJob(job);
  }

  async updateJob(seekerId: string, jobId: string, body: unknown) {
    this.ensureUuid(jobId, 'jobId');
    const existing = await this.jobsRepository.findJob(seekerId, jobId);
    if (!existing) {
      throw new NotFoundException({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      });
    }

    const payload = this.validateUpdatePayload(body);
    const job = await this.jobsRepository.updateJob(jobId, payload);
    return this.serializeJob(job);
  }

  async deleteJob(seekerId: string, jobId: string) {
    this.ensureUuid(jobId, 'jobId');
    const existing = await this.jobsRepository.findJob(seekerId, jobId);
    if (!existing) {
      throw new NotFoundException({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      });
    }

    const job = await this.jobsRepository.softDeleteJob(jobId);
    return this.serializeJob(job);
  }

  private validateCreatePayload(payload: unknown): CreateJobDto {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const errors: string[] = [];
    const title = readRequiredString(body, 'title', errors);
    const description = readRequiredString(body, 'description', errors);
    const location = readOptionalString(body, 'location', errors);
    const scheduledAt = readOptionalDate(body, 'scheduledAt', errors);
    const hourlyRateCents = readOptionalInteger(
      body,
      'hourlyRateCents',
      errors,
      0,
    );
    const status = readOptionalEnum(body, 'status', JOB_STATUSES, errors);

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid job payload',
        errors,
      });
    }

    return {
      title,
      description,
      location,
      scheduledAt,
      hourlyRateCents,
      status,
    };
  }

  private validateUpdatePayload(payload: unknown): UpdateJobDto {
    const body = ensureObject(payload);
    if (!body) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Payload must be an object',
      });
    }

    const errors: string[] = [];
    const title = readOptionalString(body, 'title', errors);
    const description = readOptionalString(body, 'description', errors);
    const location = readOptionalString(body, 'location', errors);
    const scheduledAt = readOptionalDate(body, 'scheduledAt', errors);
    const hourlyRateCents = readOptionalInteger(
      body,
      'hourlyRateCents',
      errors,
      0,
    );
    const status = readOptionalEnum(body, 'status', JOB_STATUSES, errors);

    if (
      typeof title === 'undefined' &&
      typeof description === 'undefined' &&
      typeof location === 'undefined' &&
      typeof scheduledAt === 'undefined' &&
      typeof hourlyRateCents === 'undefined' &&
      typeof status === 'undefined'
    ) {
      errors.push('At least one field must be provided');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid job payload',
        errors,
      });
    }

    return {
      ...(typeof title !== 'undefined' ? { title } : {}),
      ...(typeof description !== 'undefined' ? { description } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'location')
        ? { location }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'scheduledAt')
        ? { scheduledAt }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(body, 'hourlyRateCents')
        ? { hourlyRateCents }
        : {}),
      ...(typeof status !== 'undefined' ? { status } : {}),
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

  private serializeJob(job: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    scheduledAt: Date | null;
    hourlyRateCents: number | null;
    status: JobStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      scheduledAt: job.scheduledAt,
      hourlyRateCents: job.hourlyRateCents,
      status: lowerCaseEnum(job.status),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      deletedAt: job.deletedAt,
    };
  }
}
