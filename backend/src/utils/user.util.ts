import { User, UserProfile } from '@tacohouse/shared';
import { UserWithProfile } from 'src/types';

export type FlattenedUser = Omit<User, 'profile'> &
  Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export function flattenUser(user: UserWithProfile): FlattenedUser {
  const { profile, ...userWithoutProfile } = user;

  if (!profile) {
    return userWithoutProfile as FlattenedUser;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, userId, createdAt, updatedAt, ...profileWithoutMeta } = profile;

  return {
    ...userWithoutProfile,
    ...profileWithoutMeta,
  };
}
