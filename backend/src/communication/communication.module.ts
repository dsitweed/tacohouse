import { Module } from '@nestjs/common';

import { ChatModule } from './chat/chat.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [ChatModule, NotificationsModule, EmailModule],
})
export class CommunicationModule {}
