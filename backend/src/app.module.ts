import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { AuthModule } from 'auth/auth.module';
import { BillsModule } from 'bills/bills.module';
import { BuildingsModule } from 'property/buildings/buildings.module';
import { ChatModule } from 'chat/chat.module';
import { JwtAuthGuard, RolesGuard } from 'core/common/guards';
import { validateEnv } from 'core/config';
import { MaintenanceModule } from 'maintenance/maintenance.module';
import { NotificationsModule } from 'notifications/notifications.module';
import { PaymentsModule } from 'payments/payments.module';
import { RentalsModule } from 'rentals/rentals.module';
import { RoomsModule } from 'property/rooms/rooms.module';
import { UsersModule } from 'identify/users/users.module';

import { DashboardModule } from './analytics/dashboard/dashboard.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BuildingsModule,
    RoomsModule,
    RentalsModule,
    BillsModule,
    PaymentsModule,
    MaintenanceModule,
    ChatModule,
    NotificationsModule,
    DashboardModule,
    UploadsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
