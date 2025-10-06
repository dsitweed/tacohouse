import { UserRole } from '@prisma/client';

export class CreateAuthDto {
  email: string;

  password: string;

  role: UserRole;

  firstName: string;

  lastName: string;

  phone: string;
}
