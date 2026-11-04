import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { StorageModule } from '../../storage/storage.module';
import { UsersModule } from '../../users/users.module';
import { ProviderRepository } from '../provider.repository';
import { AdminProviderDocumentsController } from './admin-documents.controller';
import { ProviderDocumentsController } from './documents.controller';
import { ProviderDocumentsRepository } from './documents.repository';
import { ProviderDocumentsService } from './documents.service';

@Module({
  imports: [AuthModule, UsersModule, StorageModule],
  controllers: [ProviderDocumentsController, AdminProviderDocumentsController],
  providers: [
    ProviderDocumentsService,
    ProviderDocumentsRepository,
    ProviderRepository,
  ],
  exports: [ProviderDocumentsService],
})
export class ProviderDocumentsModule {}
