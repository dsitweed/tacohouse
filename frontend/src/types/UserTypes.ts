import type { DateTimeString } from './PrimitivesTypes';
import type { UserRole } from './EnumsTypes';
import type { Building } from './BuildingTypes';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string | null;
  dateOfBirth: DateTimeString;
  occupation: string;
  workplace: string;
  idCardFrontPhoto?: string | null;
  idCardBackPhoto?: string | null;
  portraitPhoto?: string | null;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface Admin {
  id: string;
  userId: string;
}

export interface Landlord {
  id: string;
  userId: string;
  buildings?: Building[];
}

export interface Tenant {
  id: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile?: UserProfile | null;
  admin?: Admin | null;
  landlord?: Landlord | null;
  tenant?: Tenant | null;
  deletedAt?: DateTimeString | null;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
