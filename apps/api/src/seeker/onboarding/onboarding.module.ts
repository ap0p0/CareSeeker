import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CarePreferencesModule } from '../care-preferences/care-preferences.module';
import { CareRecipientModule } from '../care-recipient/care-recipient.module';
import { RegistrantModule } from '../registrant/registrant.module';
import { SeekerOnboardingController } from './onboarding.controller';
import { SeekerOnboardingRepository } from './onboarding.repository';
import { SeekerOnboardingService } from './onboarding.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    RegistrantModule,
    CareRecipientModule,
    CarePreferencesModule,
  ],
  controllers: [SeekerOnboardingController],
  providers: [SeekerOnboardingService, SeekerOnboardingRepository],
  exports: [SeekerOnboardingService],
})
export class SeekerOnboardingModule {}
