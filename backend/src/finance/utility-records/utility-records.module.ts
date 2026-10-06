import { Module } from '@nestjs/common';

import { UtilityRecordsController } from './utility-records.controller';
import { UtilityRecordsService } from './utility-records.service';

@Module({
  controllers: [UtilityRecordsController],
  providers: [UtilityRecordsService],
})
export class UtilityRecordsModule {}
