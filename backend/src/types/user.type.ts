import { Admin, Landlord, Tenant, User, UserProfile } from '@tacohouse/shared';

export type UserWithRelations = User & {
  profile: UserProfile | null;
  admin: Admin | null;
  landlord: Landlord | null;
  tenant: Tenant | null;
};
