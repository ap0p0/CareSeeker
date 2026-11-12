import { Injectable } from '@nestjs/common';
import type { JobStatus, Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service';
import type { JobPostInput } from './jobs.types';

/** A job with its weekly schedule (everything the API returns). */
const jobInclude = {
  scheduleDays: { orderBy: { dayOfWeek: 'asc' } },
  scheduleWindows: {
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  },
} satisfies Prisma.JobInclude;

export type JobRecord = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

/**
 * What a new job post is prefilled from: the registrant's relationship, the
 * care recipient (never the street address) and the saved care preferences.
 */
const jobProfileSelect = {
  registrantsInfo: { select: { relationship: true } },
  careRecipient: {
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      gender: true,
      city: true,
      state: true,
      postalCode: true,
    },
  },
  seekersInfo: {
    select: {
      mobilityLevel: true,
      languagesSpoken: true,
      otherLanguage: true,
      careUrgency: true,
      preferredCaregiverGender: true,
      preferredCaregiverLanguage: true,
      homeAccessibility: true,
      culturalConsiderationsNotes: true,
    },
  },
  carePreferences: true,
  careScheduleDays: true,
  careScheduleWindows: true,
} satisfies Prisma.UserSelect;

export type JobProfileRecord = Prisma.UserGetPayload<{
  select: typeof jobProfileSelect;
}>;

type Tx = Prisma.TransactionClient;

/** The `jobs` columns of a post (everything the seeker writes). */
function jobPostColumns(input: JobPostInput) {
  const { details } = input;
  const { visit, recurring, budget, caregiverPreferences } = details;
  return {
    title: input.title,
    description: input.description,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    careFrequency: details.careFrequency,
    careTasks: details.careTasks,
    visitDate: visit?.date ?? null,
    visitStartTime: visit?.startTime ?? null,
    visitEndTime: visit?.endTime ?? null,
    visitNotes: visit?.notes ?? null,
    hoursPerWeek: recurring?.hoursPerWeek ?? null,
    careDuration: recurring?.careDuration ?? null,
    careUrgency: recurring?.careUrgency ?? null,
    scheduleFlexible: details.scheduleFlexible,
    needsOvernightCare: details.needsOvernightCare,
    needsLiveInCare: recurring?.needsLiveInCare ?? false,
    needsEmergencyCover: recurring?.needsEmergencyCover ?? false,
    requiresCaregiverVehicle: details.requiresCaregiverVehicle,
    requiresWheelchairAccessibleVehicle:
      details.requiresWheelchairAccessibleVehicle,
    petsInHome: details.petsInHome,
    homeAccessibility: details.homeAccessibility,
    specialRequirements: details.specialRequirements,
    paymentType: budget.paymentType,
    budgetCents: budget.amountCents,
    preferredCaregiverGender: caregiverPreferences.gender,
    preferredCaregiverLanguage: caregiverPreferences.language,
    requiredQualifications: caregiverPreferences.requiredQualifications,
    minYearsExperience: caregiverPreferences.minYearsExperience,
    culturalConsiderations: caregiverPreferences.culturalConsiderations,
  } satisfies Prisma.JobUncheckedUpdateInput;
}

/** The weekly schedule rows of a recurring post (none for one-time visits). */
async function writeSchedule(tx: Tx, jobId: string, input: JobPostInput) {
  const scheduleDays = input.details.recurring?.scheduleDays ?? [];
  if (scheduleDays.length > 0) {
    await tx.jobScheduleDay.createMany({
      data: scheduleDays.map((day) => ({
        jobId,
        dayOfWeek: day.dayOfWeek,
        mode: day.mode,
      })),
    });
  }

  const windows = scheduleDays.flatMap((day) =>
    day.windows.map((window) => ({
      jobId,
      dayOfWeek: day.dayOfWeek,
      startTime: window.start,
      endTime: window.end,
      endsNextDay: window.endsNextDay,
    })),
  );
  if (windows.length > 0) {
    await tx.jobScheduleWindow.createMany({ data: windows });
  }
}

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProfile(userId: string): Promise<JobProfileRecord | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: jobProfileSelect,
    });
  }

  async findCareRecipientId(userId: string): Promise<string | null> {
    const recipient = await this.prisma.careRecipient.findUnique({
      where: { userId },
      select: { id: true },
    });
    return recipient?.id ?? null;
  }

  /** Creates an open job post and its weekly schedule in one transaction. */
  createJobPost(
    seekerId: string,
    careRecipientId: string | null,
    input: JobPostInput,
  ): Promise<JobRecord> {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: { seekerId, careRecipientId, ...jobPostColumns(input) },
      });
      await writeSchedule(tx, job.id, input);
      return tx.job.findUniqueOrThrow({
        where: { id: job.id },
        include: jobInclude,
      });
    });
  }

  /**
   * Replaces the post (text, location, care details and weekly schedule)
   * in one transaction and records when it was edited. `id` is the
   * internal primary key (from `findJob`).
   */
  replaceJobPost(
    id: string,
    input: JobPostInput,
    editedAt: Date,
  ): Promise<JobRecord> {
    return this.prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: { ...jobPostColumns(input), editedAt },
      });
      await tx.jobScheduleDay.deleteMany({ where: { jobId: id } });
      await tx.jobScheduleWindow.deleteMany({ where: { jobId: id } });
      await writeSchedule(tx, id, input);
      return tx.job.findUniqueOrThrow({ where: { id }, include: jobInclude });
    });
  }

  /** Status changes by the seeker: pause, resume, close. */
  updateLifecycle(
    id: string,
    data: {
      status: JobStatus;
      pausedAt?: Date | null;
      closedAt?: Date | null;
    },
  ): Promise<JobRecord> {
    return this.prisma.job.update({
      where: { id },
      data,
      include: jobInclude,
    });
  }

  async listJobs(seekerId: string, statuses?: JobStatus[]) {
    return this.prisma.job.findMany({
      where: {
        seekerId,
        deletedAt: null,
        ...(statuses && statuses.length > 0
          ? { status: { in: statuses } }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      include: jobInclude,
    });
  }

  /** A job of this seeker by its public `jobId`. */
  async findJob(seekerId: string, jobId: string) {
    return this.prisma.job.findFirst({
      where: {
        jobId,
        seekerId,
        deletedAt: null,
      },
      include: jobInclude,
    });
  }

  async softDeleteJob(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: jobInclude,
    });
  }
}
