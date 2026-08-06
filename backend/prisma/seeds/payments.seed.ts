import { faker } from '@faker-js/faker';
import {
  Bill,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
} from 'generated/prisma/client';
import { PaymentCreateManyInput } from 'generated/prisma/models';

export async function seedPayments(
  prisma: PrismaClient,
  bills: Bill[],
): Promise<Payment[]> {
  console.log('💰 Seeding payments...');

  if (bills.length === 0) {
    console.log('⚠️ No bills records found, skipping payments seed');
    return [];
  }

  const paymentData: PaymentCreateManyInput[] = bills.map((bill) => {
    return {
      billId: bill.id,
      amount: bill.totalAmount,
      paymentMethod: faker.helpers.arrayElement(Object.values(PaymentMethod)),
      status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
    };
  });

  const payments = await prisma.payment.createManyAndReturn({
    data: paymentData,
    skipDuplicates: true,
  });

  console.log(`✅ Payments seeded: ${payments.length} payments`);

  return payments;
}
