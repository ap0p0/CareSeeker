import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CarePreferencesModule } from './care-preferences/care-preferences.module';
import { CareRecipientModule } from './care-recipient/care-recipient.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SeekerOnboardingModule } from './onboarding/onboarding.module';
import { RegistrantModule } from './registrant/registrant.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SavedProvidersModule } from './saved-providers/saved-providers.module';
import { SeekerController } from './seeker.controller';
import { SeekerRepository } from './seeker.repository';
import { SeekerService } from './seeker.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    JobsModule,
    SavedProvidersModule,
    NotificationsModule,
    MessagesModule,
    ReviewsModule,
    SubscriptionsModule,
    RegistrantModule,
    CareRecipientModule,
    CarePreferencesModule,
    SeekerOnboardingModule,
  ],
  controllers: [SeekerController],
  providers: [SeekerService, SeekerRepository],
  exports: [SeekerService, SeekerRepository],
})
export class SeekerModule {}
