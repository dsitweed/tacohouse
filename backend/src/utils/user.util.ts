import { User, UserProfile } from '@tacohouse/shared';
import { UserWithProfile } from 'src/types';

export type FlattenedUser = Omit<User, 'profile' | 'password'> &
  Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export function flattenUser(user: UserWithProfile): FlattenedUser {
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
