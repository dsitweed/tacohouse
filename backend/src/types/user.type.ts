import type {
  Admin,
  Landlord,
  Tenant,
  User,
  UserProfile,
} from '@prisma/client';

export type UserWithRelations = User & {
  profile: UserProfile | null;
  admin: Admin | null;
  landlord: Landlord | null;
  tenant: Tenant | null;
};
