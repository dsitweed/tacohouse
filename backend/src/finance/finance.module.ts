import { Module } from '@nestjs/common';

import { BillsModule } from './bills/bills.module';
import { PaymentsModule } from './payments/payments.module';
import { UtilityRecordsModule } from './utility-records/utility-records.module';

@Module({
  imports: [BillsModule, PaymentsModule, UtilityRecordsModule],
})
export class FinanceModule {}
