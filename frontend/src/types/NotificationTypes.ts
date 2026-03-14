import type { NotificationType } from './EnumsTypes';
import type { User } from './UserTypes';

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string | null;
  relatedId?: string | null;
  relatedType?: string | null;
  createdAt: string;
  updatedAt: string;
}
