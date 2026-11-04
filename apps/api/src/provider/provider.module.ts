import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProviderAvailabilityModule } from './availability/availability.module';
import { ProviderAccountSettingsModule } from './account-settings/account-settings.module';
import { ProviderCareRequestsModule } from './care-requests/care-requests.module';
import { ProviderDashboardModule } from './dashboard/dashboard.module';
import { ProviderDocumentsModule } from './documents/documents.module';
import { ProviderEarningsModule } from './earnings/earnings.module';
import { ProviderNotificationsModule } from './notifications/notifications.module';
import { ProviderOnboardingModule } from './onboarding/onboarding.module';
import { ProviderOverviewModule } from './overview/overview.module';
import { ProviderProfileModule } from './profile/profile.module';
import { ProviderReviewsModule } from './reviews/reviews.module';
import { ProviderServiceProfileModule } from './service-profile/service-profile.module';
import { ProviderVerificationModule } from './verification/verification.module';
import { ProviderWorkPreferencesModule } from './work-preferences/work-preferences.module';
import { StorageModule } from '../storage/storage.module';
import { ProviderProfileImageStorageService } from './common/profile-image-storage.service';
import { ProviderController } from './provider.controller';
import { ProviderRepository } from './provider.repository';
import { ProviderService } from './provider.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    StorageModule,
    ProviderProfileModule,
    ProviderServiceProfileModule,
    ProviderDocumentsModule,
    ProviderOnboardingModule,
    ProviderWorkPreferencesModule,
    ProviderOverviewModule,
    ProviderAvailabilityModule,
    ProviderCareRequestsModule,
    ProviderReviewsModule,
    ProviderNotificationsModule,
    ProviderVerificationModule,
    ProviderDashboardModule,
    ProviderAccountSettingsModule,
    ProviderEarningsModule,
  ],
  controllers: [ProviderController],
  providers: [
    ProviderService,
    ProviderRepository,
    ProviderProfileImageStorageService,
  ],
  exports: [ProviderRepository, ProviderProfileImageStorageService],
})
export class ProviderModule {}
