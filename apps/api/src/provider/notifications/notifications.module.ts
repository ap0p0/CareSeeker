import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderNotificationsController } from './notifications.controller';
import { ProviderNotificationsRepository } from './notifications.repository';
import { ProviderNotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderNotificationsController],
  providers: [ProviderNotificationsService, ProviderNotificationsRepository],
})
export class ProviderNotificationsModule {}
