/*
  Warnings:

  - You are about to drop the column `billId` on the `payment_confirmations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `payment_confirmations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `payment_confirmations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payment_confirmations" DROP CONSTRAINT "payment_confirmations_billId_fkey";

-- DropIndex
DROP INDEX "payment_confirmations_billId_key";

-- AlterTable
ALTER TABLE "payment_confirmations" DROP COLUMN "billId",
ADD COLUMN     "paymentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_confirmations_paymentId_key" ON "payment_confirmations"("paymentId");

-- AddForeignKey
ALTER TABLE "payment_confirmations" ADD CONSTRAINT "payment_confirmations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
