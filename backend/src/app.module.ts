import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from 'app.controller';
import { AppService } from 'app.service';
import { CommunicationModule } from 'communication/communication.module';
import { JwtAuthGuard, RolesGuard } from 'core/common/guards';
import { validateEnv } from 'core/config';
import { CoreModule } from 'core/core.module';
import { FinanceModule } from 'finance/finance.module';
import { IdentifyModule } from 'identify/identify.module';
import { InfrastructureModule } from 'infrastructure/infrastructure.module';
import { LeasingModule } from 'leasing/leasing.module';
import { OperationsModule } from 'operations/operations.module';
import { PropertyModule } from 'property/property.module';

import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    AnalyticsModule,
    CommunicationModule,
    CoreModule,
    FinanceModule,
    IdentifyModule,
    InfrastructureModule,
    LeasingModule,
    OperationsModule,
    PropertyModule,
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
