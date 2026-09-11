import { Module } from '@nestjs/common';

import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [ChatModule, NotificationsModule],
})
export class CommunicationModule {}
