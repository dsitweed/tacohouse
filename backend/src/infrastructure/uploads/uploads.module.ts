import { Module } from '@nestjs/common';
import { R2StorageService } from 'infrastructure/storage/r2-storage.service';

import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  providers: [R2StorageService, UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}
