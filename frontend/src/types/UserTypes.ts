import type { Building } from './BuildingTypes';
import type { UserRole } from './EnumsTypes';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string | null;
  dateOfBirth: string;
  occupation: string;
  workplace: string;
  idCardFrontPhoto?: string | null;
  idCardBackPhoto?: string | null;
  portraitPhoto?: string | null;
  createdAt: string;
  updatedAt: string;
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
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
