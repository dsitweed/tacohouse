import type { DateTimeString } from './PrimitivesTypes';
import type { MessageType } from './EnumsTypes';
import type { User } from './UserTypes';

export interface ChatGroup {
  id: string;
  buildingId: string;
  name: string;
  description?: string | null;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface ChatGroupMember {
  id: string;
  chatGroupId: string;
  userId: string;
  user?: User;
  joinedAt: DateTimeString;
}

export interface Message {
  id: string;
  senderId: string;
  senderUser?: User;
  content: string;
  messageType: MessageType;
  chatGroupId?: string | null;
  recipientId?: string | null;
  recipientUser?: User | null;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
