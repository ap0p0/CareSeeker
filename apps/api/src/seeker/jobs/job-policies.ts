import { ConflictException } from '@nestjs/common';
import { JobStatus } from '../../../generated/prisma/client.js';

/**
 * What a seeker may do with their job in each status. Mirrors the client
 * app (`apps/web/src/queries/client/jobPolicies.ts`):
 *
 * - edit the post — only while OPEN (once candidates interview or someone
 *   is hired, they agreed to the job as it was);
 * - pause — only while OPEN; resume — only while PAUSED;
 * - close (archive) — right away only while OPEN. Any other running job
 *   needs a reason and an admin's approval, which is not built yet, so
 *   the API refuses with `CLOSURE_NEEDS_APPROVAL`.
 *
 * Every refusal is a `409` with a code and a message the client can show.
 */

const FINISHED: readonly JobStatus[] = [
  JobStatus.CLOSED,
  JobStatus.COMPLETED,
  JobStatus.CANCELLED,
];

const conflict = (code: string, message: string) =>
  new ConflictException({ code, message });

export function assertCanEdit(status: JobStatus): void {
  if (status !== JobStatus.OPEN) {
    throw conflict(
      'JOB_NOT_EDITABLE',
      'Only open jobs can be edited — once candidates are interviewing or a caregiver is hired, the requirements are locked.',
    );
  }
}

export function assertCanPause(status: JobStatus): void {
  if (status !== JobStatus.OPEN) {
    throw conflict('JOB_NOT_PAUSABLE', 'Only open jobs can be paused.');
  }
}

export function assertCanResume(status: JobStatus): void {
  if (status !== JobStatus.PAUSED) {
    throw conflict('JOB_NOT_PAUSED', 'This job is not paused.');
  }
}

export function assertCanClose(status: JobStatus): void {
  if (FINISHED.includes(status)) {
    throw conflict('JOB_FINISHED', 'This job is already finished.');
  }
  if (status !== JobStatus.OPEN) {
    throw conflict(
      'CLOSURE_NEEDS_APPROVAL',
      'Only open jobs can be closed right away. Resume the job first, or ask an admin to close it.',
    );
  }
}
