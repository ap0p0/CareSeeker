import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CarePreferencesController } from './care-preferences.controller';
import { CarePreferencesRepository } from './care-preferences.repository';
import { CarePreferencesService } from './care-preferences.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CarePreferencesController],
  providers: [CarePreferencesService, CarePreferencesRepository],
  exports: [CarePreferencesService],
})
export class CarePreferencesModule {}
