import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository],
  exports: [JobsService, JobsRepository],
})
export class JobsModule {}
