import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { AuthModule } from 'auth/auth.module';
import { validateEnv } from 'config';

import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    // UsersModule,
    // BuildingsModule,
    // RoomsModule,
    // RentalsModule,
    // BillsModule,
    // PaymentsModule,
    // MaintenanceModule,
    // ChatModule,
    // NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //   {
    //     provide: APP_GUARD,
    //     useClass: JwtAuthGuard,
    //   },
    //   {
    //     provide: APP_GUARD,
    //     useClass: RolesGuard,
    //   },
  ],
})
export class AppModule {}
