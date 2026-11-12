import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { JobsService } from './jobs.service';

/**
 * Job posts of the signed-in seeker. `:jobId` is the public job id
 * (`jobs.jobId`, 16 hex characters), never the internal UUID. `/draft`
 * routes are declared before `/:jobId` so they are not read as a job id.
 */
@Controller('seeker/jobs')
@UseGuards(SupabaseJwtGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /** A new job post prefilled from the profile (nothing is saved). */
  @Get('draft')
  async getDraft(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.jobsService.getDraft(seekerId);
  }

  /** Title + description written for edited details (nothing is saved). */
  @Post('draft/text')
  @HttpCode(HttpStatus.OK)
  async generateText(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    return this.jobsService.generateText(seekerId, body);
  }

  /** Posts a job: `{ title, description, city, state, postalCode, details }`. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJob(@Req() req: AuthRequest, @Body() body: unknown) {
    const seekerId = requireSeekerUser(req);
    const job = await this.jobsService.createJob(seekerId, body);

    return {
      success: true,
      message: 'Job created successfully',
      data: job,
    };
  }

  @Get()
  async listJobs(@Req() req: AuthRequest) {
    const seekerId = requireSeekerUser(req);
    return this.jobsService.listJobs(seekerId);
  }

  @Get(':jobId')
  async getJob(@Req() req: AuthRequest, @Param('jobId') jobId: string) {
    const seekerId = requireSeekerUser(req);
    return this.jobsService.getJob(seekerId, jobId);
  }

  /** Edits the post (full replacement, same payload as creating; open jobs only). */
  @Put(':jobId')
  async editJob(
    @Req() req: AuthRequest,
    @Param('jobId') jobId: string,
    @Body() body: unknown,
  ) {
    const seekerId = requireSeekerUser(req);
    const job = await this.jobsService.editJob(seekerId, jobId, body);

    return {
      success: true,
      message: 'Job updated successfully',
      data: job,
    };
  }

  /** Hides an open job from caregivers. */
  @Post(':jobId/pause')
  @HttpCode(HttpStatus.OK)
  async pauseJob(@Req() req: AuthRequest, @Param('jobId') jobId: string) {
    const seekerId = requireSeekerUser(req);
    return { data: await this.jobsService.pauseJob(seekerId, jobId) };
  }

  /** Makes a paused job open again. */
  @Post(':jobId/resume')
  @HttpCode(HttpStatus.OK)
  async resumeJob(@Req() req: AuthRequest, @Param('jobId') jobId: string) {
    const seekerId = requireSeekerUser(req);
    return { data: await this.jobsService.resumeJob(seekerId, jobId) };
  }

  /** Closes an open job (moves it to the archive). */
  @Post(':jobId/close')
  @HttpCode(HttpStatus.OK)
  async closeJob(@Req() req: AuthRequest, @Param('jobId') jobId: string) {
    const seekerId = requireSeekerUser(req);
    return { data: await this.jobsService.closeJob(seekerId, jobId) };
  }

  @Delete(':jobId')
  async deleteJob(@Req() req: AuthRequest, @Param('jobId') jobId: string) {
    const seekerId = requireSeekerUser(req);
    const job = await this.jobsService.deleteJob(seekerId, jobId);

    return {
      success: true,
      message: 'Job deleted successfully',
      data: job,
    };
  }
}
