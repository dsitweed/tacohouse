import { faker } from '@faker-js/faker';
import {
  Payment,
  PaymentConfirmation,
  PrismaClient,
} from 'generated/prisma/client';
import { PaymentConfirmationCreateManyInput } from 'generated/prisma/models';

export async function seedPaymentConfirmations(
  prisma: PrismaClient,
  payments: Payment[],
): Promise<PaymentConfirmation[]> {
  console.log('💰 Seeding payment confirmations...');

  if (payments.length === 0) {
    console.log('⚠️ No payments found, skipping payment confirmations seed');
    return [];
  }

  const paymentsToRental = await prisma.payment.findMany({
    where: {
      id: { in: payments.map((payment) => payment.id) },
    },
    include: {
      bill: {
        include: {
          room: {
            include: {
              rentals: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      },
    },
  });

  const paymentConfirmationsData: PaymentConfirmationCreateManyInput[] = [];

  for (const payment of paymentsToRental) {
    const firstRental = payment.bill.room.rentals[0];

    if (!firstRental) {
      continue;
    }

    const tenantConfirmed = faker.datatype.boolean();
    let tenantConfirmedAt: Date | undefined = undefined;

    if (tenantConfirmed) {
      tenantConfirmedAt = new Date();
    }

    paymentConfirmationsData.push({
      paymentId: payment.id,
      tenantId: firstRental.tenantId,
      tenantConfirmed,
      tenantConfirmedAt,
      proofImages: faker.helpers.arrayElements(PAYMENT_PROOF_IMAGES, 1),
    });
  }

  const paymentConfirmations =
    await prisma.paymentConfirmation.createManyAndReturn({
      data: paymentConfirmationsData,
      skipDuplicates: true,
    });

  console.log(
    `✅ Payment confirmations seeded: ${paymentConfirmations.length} `,
  );

  return paymentConfirmations;
}

const PAYMENT_PROOF_IMAGES = [
  'https://unsplash.com/photos/MYbhN8KaaEc',
  'https://unsplash.com/photos/2FPjlAyMQTA',
  'https://unsplash.com/photos/q-W_WVW-eV0',
  'https://unsplash.com/photos/Dvv8EP8yGlk',
  'https://unsplash.com/photos/1T8x0-e7cWk',
];
