import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { AuthModule } from 'auth/auth.module';
import { BillsModule } from 'bills/bills.module';
import { BuildingsModule } from 'buildings/buildings.module';
import { ChatModule } from 'chat/chat.module';
import { JwtAuthGuard, RolesGuard } from 'common/guards';
import { validateEnv } from 'config';
import { MaintenanceModule } from 'maintenance/maintenance.module';
import { NotificationsModule } from 'notifications/notifications.module';
import { PaymentsModule } from 'payments/payments.module';
import { RentalsModule } from 'rentals/rentals.module';
import { RoomsModule } from 'rooms/rooms.module';
import { UsersModule } from 'users/users.module';

import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';

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
