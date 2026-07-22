import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProviderAvailabilityModule } from './availability/availability.module';
import { ProviderAccountSettingsModule } from './account-settings/account-settings.module';
import { ProviderCareRequestsModule } from './care-requests/care-requests.module';
import { ProviderDashboardModule } from './dashboard/dashboard.module';
import { ProviderEarningsModule } from './earnings/earnings.module';
import { ProviderNotificationsModule } from './notifications/notifications.module';
import { ProviderProfileModule } from './profile/profile.module';
import { ProviderReviewsModule } from './reviews/reviews.module';
import { ProviderVerificationModule } from './verification/verification.module';
import { ProviderController } from './provider.controller';
import { ProviderRepository } from './provider.repository';
import { ProviderService } from './provider.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProviderProfileModule,
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
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderRepository],
})
export class ProviderModule {}
