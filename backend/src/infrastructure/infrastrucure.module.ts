import { Module } from '@nestjs/common';

import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [StorageModule, UploadsModule],
})
export class InfrastructureModule {}
