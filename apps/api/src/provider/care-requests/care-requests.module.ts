import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { ProviderCareRequestsController } from './care-requests.controller';
import { ProviderCareRequestsRepository } from './care-requests.repository';
import { ProviderCareRequestsService } from './care-requests.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProviderCareRequestsController],
  providers: [
    ProviderCareRequestsService,
    ProviderCareRequestsRepository,
    ProviderRepository,
  ],
})
export class ProviderCareRequestsModule {}
