-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "priceInCents" INTEGER NOT NULL DEFAULT 0;
