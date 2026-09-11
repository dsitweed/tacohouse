import { Module } from '@nestjs/common';
import { R2StorageService } from 'infrastructure/storage/r2-storage.service';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, R2StorageService],
})
export class RoomsModule {}
