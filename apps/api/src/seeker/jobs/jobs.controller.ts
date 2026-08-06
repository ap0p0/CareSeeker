import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseJwtGuard } from '../../auth/supabase-jwt.guard';
import type { AuthRequest } from '../../auth/auth-types';
import { requireSeekerUser } from '../require-seeker';
import { JobsService } from './jobs.service';

@Controller('seeker/jobs')
@UseGuards(SupabaseJwtGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

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

  @Patch(':jobId')
  async updateJob(
    @Req() req: AuthRequest,
    @Param('jobId') jobId: string,
    @Body() body: unknown,
  ) {
    const seekerId = requireSeekerUser(req);
    const job = await this.jobsService.updateJob(seekerId, jobId, body);

    return {
      success: true,
      message: 'Job updated successfully',
      data: job,
    };
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
