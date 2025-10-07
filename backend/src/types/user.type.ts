import { Admin, Landlord, Tenant, User } from '@tacohouse/shared';

export type UserWithRoles = User & {
  landlord: Landlord | null;
  tenant: Tenant | null;
  admin: Admin | null;
};
