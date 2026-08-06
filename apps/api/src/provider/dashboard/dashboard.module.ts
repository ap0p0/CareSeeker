import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderDashboardController } from './dashboard.controller';
import { ProviderDashboardRepository } from './dashboard.repository';
import { ProviderDashboardService } from './dashboard.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderDashboardController],
  providers: [
    ProviderDashboardService,
    ProviderDashboardRepository,
    ProviderRepository,
  ],
})
export class ProviderDashboardModule {}
