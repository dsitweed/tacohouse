import { Module } from '@nestjs/common';
import { NotificationsModule } from 'communication/notifications/notifications.module';

import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';

@Module({
  imports: [NotificationsModule],
  controllers: [BillsController],
  providers: [BillsService],
})
export class BillsModule {}
