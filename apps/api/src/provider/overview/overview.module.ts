import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ProviderDocumentsModule } from '../documents/documents.module';
import { ProviderOnboardingModule } from '../onboarding/onboarding.module';
import { ProviderProfileModule } from '../profile/profile.module';
import { ProviderServiceProfileModule } from '../service-profile/service-profile.module';
import { ProviderWorkPreferencesModule } from '../work-preferences/work-preferences.module';
import { ProviderOverviewController } from './overview.controller';
import { ProviderOverviewService } from './overview.service';

@Module({
  imports: [
    AuthModule,
    ProviderProfileModule,
    ProviderServiceProfileModule,
    ProviderWorkPreferencesModule,
    ProviderDocumentsModule,
    ProviderOnboardingModule,
  ],
  controllers: [ProviderOverviewController],
  providers: [ProviderOverviewService],
})
export class ProviderOverviewModule {}
