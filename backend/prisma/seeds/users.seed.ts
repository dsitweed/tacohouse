import { faker } from '@faker-js/faker';
import { PrismaClient, UserRole } from '@tacohouse/shared';
import * as argon from 'argon2';
import { UserWithRelations } from 'src/types';

type UserData = {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  dateOfBirth: Date;
};

type UserWithProfileData = UserData & {
  occupation: string;
  workplace: string;
};

const hashPassword = async () => argon.hash('password');

export async function seedUsers(prisma: PrismaClient): Promise<{
  adminUsers: UserWithRelations[];
  landlordUsers: UserWithRelations[];
  tenantUsers: UserWithRelations[];
}> {
  console.log('👤 Seeding users...');

  const adminUsers = await seedAdmins(prisma);

  const landlordUsers = await seedLandlords(prisma);

  const tenantUsers = await seedTenants(prisma);

  console.log('✅ All user groups seeded successfully!');

  return {
    adminUsers,
    landlordUsers,
    tenantUsers,
  };
}

export async function seedAdmins(
  prisma: PrismaClient,
): Promise<UserWithRelations[]> {
  console.log('👤 Seeding Admins...');

  const hashedPassword = await hashPassword();

  // Create 5 admin users
  const adminCount = 5;
  const admins: UserData[] = [];

  for (let i = 1; i <= adminCount; i++) {
    const email = `admin${i}@example.com`;

    admins.push({
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
    });
  }

  const adminUsers = await Promise.all(
    admins.map(
      async (admin) =>
        await prisma.user.upsert({
          where: { email: admin.email },
          update: {},
          create: {
            email: admin.email,
            password: hashedPassword,
            role: UserRole.ADMIN,
            isActive: true,
            profile: {
              create: {
                firstName: admin.firstName,
                lastName: admin.lastName,
                phone: admin.phone,
                avatar: admin.avatar,
                dateOfBirth: admin.dateOfBirth,
                occupation: 'System Administrator',
                workplace: 'Tacohouse',
              },
            },
            admin: {
              create: {},
            },
          },
          include: {
            profile: true,
            admin: true,
            tenant: true,
            landlord: true,
          },
        }),
    ),
  );

  console.log(`✅ Admins seeded: ${adminUsers.length}`);
  return adminUsers;
}

export async function seedLandlords(
  prisma: PrismaClient,
): Promise<UserWithRelations[]> {
  console.log('🏠 Seeding Landlords...');

  const hashedPassword = await hashPassword();

  // Create 10 landlords
  const landlordCount = 10;
  const landlordsData: UserData[] = [];

  for (let i = 1; i <= landlordCount; i++) {
    const email = `landlord${i}@example.com`;

    landlordsData.push({
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      dateOfBirth: faker.date.birthdate({ min: 35, max: 60, mode: 'age' }),
    });
  }

  const landlordUsers = await Promise.all(
    landlordsData.map(
      async (landlord) =>
        await prisma.user.upsert({
          where: { email: landlord.email },
          update: {},
          create: {
            email: landlord.email,
            password: hashedPassword,
            role: UserRole.LANDLORD,
            isActive: true,
            profile: {
              create: {
                firstName: landlord.firstName,
                lastName: landlord.lastName,
                phone: landlord.phone,
                avatar: landlord.avatar,
                occupation: 'Real Estate Investor',
                workplace: 'Self-employed',
                dateOfBirth: landlord.dateOfBirth,
              },
            },
            landlord: { create: {} },
          },
          include: {
            profile: true,
            landlord: true,
            admin: true,
            tenant: true,
          },
        }),
    ),
  );

  console.log(`✅ Landlords seeded: ${landlordUsers.length}`);
  return landlordUsers;
}

export async function seedTenants(
  prisma: PrismaClient,
): Promise<UserWithRelations[]> {
  console.log('👥 Seeding Tenants...');

  const hashedPassword = await hashPassword();

  // Create 15 tenants (more tenants than landlords is realistic)
  const tenantCount = 15;
  const tenantsData: UserWithProfileData[] = [];

  for (let i = 1; i <= tenantCount; i++) {
    const email = `tenant${i}@example.com`;

    tenantsData.push({
      email,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      occupation: faker.person.jobTitle(),
      workplace: faker.company.name(),
      dateOfBirth: faker.date.birthdate({ min: 22, max: 45, mode: 'age' }),
    });
  }

  const tenantUsers = await Promise.all(
    tenantsData.map((tenant) =>
      prisma.user.upsert({
        where: { email: tenant.email },
        update: {},
        create: {
          email: tenant.email,
          password: hashedPassword,
          role: UserRole.TENANT,
          isActive: true,
          profile: {
            create: {
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              phone: tenant.phone,
              avatar: tenant.avatar,
              dateOfBirth: tenant.dateOfBirth,
              occupation: tenant.occupation,
              workplace: tenant.workplace,
            },
          },
          tenant: { create: {} },
        },
        include: {
          profile: true,
          tenant: true,
          admin: true,
          landlord: true,
        },
      }),
    ),
  );

  console.log(`✅ Tenants seeded: ${tenantUsers.length}`);
  return tenantUsers;
}
