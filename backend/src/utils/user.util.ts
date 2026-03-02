import type { UserProfile } from '@prisma/client';
import { UserWithRelations } from 'src/types';

export type FlattenedUser = Omit<UserWithRelations, 'profile' | 'password'> &
  Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export function flattenUser(user: UserWithRelations): FlattenedUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, profile, ...userFields } = user;

  if (!profile) {
    return userFields as FlattenedUser;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, userId, createdAt, updatedAt, ...profileWithoutMeta } = profile;

  return {
    ...userFields,
    ...profileWithoutMeta,
  };
}
