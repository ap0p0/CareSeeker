import { Module } from '@nestjs/common';
import { PresignupsController } from './presignups.controller';
import { PresignupsService } from './presignups.service';

@Module({
  controllers: [PresignupsController],
  providers: [PresignupsService],
})
export class PresignupsModule {}
