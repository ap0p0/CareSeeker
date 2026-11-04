import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderOnboardingController } from './onboarding.controller';
import { ProviderOnboardingRepository } from './onboarding.repository';
import { ProviderOnboardingService } from './onboarding.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderOnboardingController],
  providers: [
    ProviderOnboardingService,
    ProviderOnboardingRepository,
    ProviderRepository,
  ],
  exports: [ProviderOnboardingService],
})
export class ProviderOnboardingModule {}
