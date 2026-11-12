import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '../../../generated/prisma/client.js';
import { lowerCaseEnum } from '../seeker.validation';
import {
  jobDetailsFromJob,
  jobDetailsFromProfile,
  serializeJobDetails,
} from './job-details';
import {
  assertCanClose,
  assertCanEdit,
  assertCanPause,
  assertCanResume,
} from './job-policies';
import { generateJobText } from './job-text.generator';
import {
  JobsRepository,
  type JobProfileRecord,
  type JobRecord,
} from './jobs.repository';
import type {
  JobDraftResponse,
  JobLocation,
  JobResponse,
  JobText,
  JobTextContext,
} from './jobs.types';
import {
  isJobId,
  validateJobPostPayload,
  validateJobTextPayload,
} from './jobs.validation';

/** Jobs that are still running (the open jobs page). */
const RUNNING_STATUSES: JobStatus[] = [
  JobStatus.OPEN,
  JobStatus.PAUSED,
  JobStatus.IN_PROGRESS,
];

/** What the text generator may know about the profile (no name, no street). */
function textContext(
  profile: JobProfileRecord | null,
  location: Partial<JobLocation>,
  today: Date,
): JobTextContext {
  const recipient = profile?.careRecipient ?? null;
  const info = profile?.seekersInfo ?? null;

  return {
    careFor: profile?.registrantsInfo ? 'other' : 'self',
    relationship: profile?.registrantsInfo?.relationship ?? null,
    recipient: recipient
      ? {
          gender: recipient.gender,
          dateOfBirth: recipient.dateOfBirth,
          mobilityLevel: info?.mobilityLevel ?? null,
          languagesSpoken: info?.languagesSpoken ?? [],
          otherLanguage: info?.otherLanguage ?? null,
        }
      : null,
    city: location.city || null,
    state: location.state || null,
    today,
  };
}

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  /**
   * A new, unsaved job post prefilled from the seeker's profile: the care
   * recipient's city / state / ZIP, the saved care preferences and a
   * generated title and description. Accounts registered for oneself (or
   * without saved care needs) get an empty draft to fill in.
   */
  async getDraft(
    seekerId: string,
    today = new Date(),
  ): Promise<JobDraftResponse> {
    const profile = await this.jobsRepository.findProfile(seekerId);
    const recipient = profile?.careRecipient ?? null;
    const location: JobLocation = {
      city: recipient?.city ?? '',
      state: recipient?.state ?? '',
      postalCode: recipient?.postalCode ?? '',
    };
    const details =
      profile?.registrantsInfo && profile.carePreferences
        ? jobDetailsFromProfile({
            carePreferences: profile.carePreferences,
            seekersInfo: profile.seekersInfo,
            careScheduleDays: profile.careScheduleDays,
            careScheduleWindows: profile.careScheduleWindows,
          })
        : null;
    const text: JobText = details
      ? generateJobText(details, textContext(profile, location, today))
      : { title: '', description: '' };

    return {
      source:
        profile?.registrantsInfo && recipient
          ? { careRecipientId: recipient.id, careRecipientName: recipient.name }
          : null,
      draft: {
        ...text,
        ...location,
        details: details ? serializeJobDetails(details) : null,
      },
    };
  }

  /** A fresh title and description for edited job details (not saved). */
  async generateText(
    seekerId: string,
    body: unknown,
    today = new Date(),
  ): Promise<JobText> {
    const input = validateJobTextPayload(body, today);
    const profile = await this.jobsRepository.findProfile(seekerId);
    return generateJobText(input.details, textContext(profile, input, today));
  }

  /** Posts a job (status `open`), linked to the seeker's care recipient. */
  async createJob(
    seekerId: string,
    body: unknown,
    today = new Date(),
  ): Promise<JobResponse> {
    const input = validateJobPostPayload(body, today);
    const careRecipientId =
      await this.jobsRepository.findCareRecipientId(seekerId);
    const job = await this.jobsRepository.createJobPost(
      seekerId,
      careRecipientId,
      input,
    );
    return this.serializeJob(job);
  }

  /** Running jobs (open, paused, in progress), newest first. */
  async listJobs(seekerId: string): Promise<JobResponse[]> {
    const jobs = await this.jobsRepository.listJobs(seekerId, RUNNING_STATUSES);
    return jobs.map((job) => this.serializeJob(job));
  }

  /** One job by its public id, finished ones included. */
  async getJob(seekerId: string, jobId: string): Promise<JobResponse> {
    return this.serializeJob(await this.findOwnJob(seekerId, jobId));
  }

  /**
   * `PUT /seeker/jobs/:jobId` — replaces the post (same payload and rules
   * as creating one). Only open jobs can be edited.
   */
  async editJob(
    seekerId: string,
    jobId: string,
    body: unknown,
    today = new Date(),
  ): Promise<JobResponse> {
    const existing = await this.findOwnJob(seekerId, jobId);
    assertCanEdit(existing.status);
    const input = validateJobPostPayload(body, today);
    const job = await this.jobsRepository.replaceJobPost(
      existing.id,
      input,
      new Date(),
    );
    return this.serializeJob(job);
  }

  /** Hides an open job from caregivers. */
  async pauseJob(seekerId: string, jobId: string): Promise<JobResponse> {
    const existing = await this.findOwnJob(seekerId, jobId);
    assertCanPause(existing.status);
    return this.serializeJob(
      await this.jobsRepository.updateLifecycle(existing.id, {
        status: JobStatus.PAUSED,
        pausedAt: new Date(),
      }),
    );
  }

  /** Makes a paused job open again. */
  async resumeJob(seekerId: string, jobId: string): Promise<JobResponse> {
    const existing = await this.findOwnJob(seekerId, jobId);
    assertCanResume(existing.status);
    return this.serializeJob(
      await this.jobsRepository.updateLifecycle(existing.id, {
        status: JobStatus.OPEN,
        pausedAt: null,
      }),
    );
  }

  /** Closes an open job: it moves to the archive (history). */
  async closeJob(seekerId: string, jobId: string): Promise<JobResponse> {
    const existing = await this.findOwnJob(seekerId, jobId);
    assertCanClose(existing.status);
    return this.serializeJob(
      await this.jobsRepository.updateLifecycle(existing.id, {
        status: JobStatus.CLOSED,
        closedAt: new Date(),
      }),
    );
  }

  /** Soft delete (the job disappears from every list). */
  async deleteJob(seekerId: string, jobId: string): Promise<JobResponse> {
    const existing = await this.findOwnJob(seekerId, jobId);
    const job = await this.jobsRepository.softDeleteJob(existing.id);
    return this.serializeJob(job);
  }

  /** A job of this seeker by public id — `400` malformed, `404` unknown. */
  private async findOwnJob(seekerId: string, jobId: string) {
    this.ensureJobId(jobId);
    const job = await this.jobsRepository.findJob(seekerId, jobId);
    if (!job) {
      throw new NotFoundException({
        code: 'JOB_NOT_FOUND',
        message: 'Job not found',
      });
    }
    return job;
  }

  /** `:jobId` routes take the public job id (`jobs.jobId`). */
  private ensureJobId(value: string) {
    if (!isJobId(value)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'jobId must be a job id (16 lowercase hex characters)',
      });
    }
  }

  private serializeJob(job: JobRecord): JobResponse {
    const details = jobDetailsFromJob(job);

    return {
      jobId: job.jobId,
      status: lowerCaseEnum(job.status),
      title: job.title,
      description: job.description,
      careRecipientId: job.careRecipientId,
      city: job.city,
      state: job.state,
      postalCode: job.postalCode,
      details: details ? serializeJobDetails(details) : null,
      location: job.location,
      scheduledAt: job.scheduledAt,
      hourlyRateCents: job.hourlyRateCents,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      editedAt: job.editedAt,
      pausedAt: job.pausedAt,
      closedAt: job.closedAt,
      deletedAt: job.deletedAt,
    };
  }
}
