import { Module } from '@nestjs/common';

import { BuildingsModule } from './buildings/buildings.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [BuildingsModule, RoomsModule],
})
export class PropertyModule {}
