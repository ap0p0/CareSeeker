import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
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
  ],
  controllers: [SeekerController],
  providers: [SeekerService, SeekerRepository],
  exports: [SeekerService, SeekerRepository],
})
export class SeekerModule {}
