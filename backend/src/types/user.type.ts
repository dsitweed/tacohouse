import { Admin, Landlord, Tenant, User, UserProfile } from '@tacohouse/shared';

export type UserWithRoles = User & {
  landlord: Landlord | null;
  tenant: Tenant | null;
  admin: Admin | null;
};

export type UserWithProfile = User & {
  profile: UserProfile | null;
};
