import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PresignupsModule } from './presignups/presignups.module';
import { ProviderModule } from './provider/provider.module';
import { SeekerModule } from './seeker/seeker.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PresignupsModule,
    ProviderModule,
    SeekerModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {}
