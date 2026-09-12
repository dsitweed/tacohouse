import { UserWhereInput } from 'generated/prisma/models';

export const ACTIVE_USER_WHERE = {
  isActive: true,
  deletedAt: null,
} satisfies UserWhereInput;
