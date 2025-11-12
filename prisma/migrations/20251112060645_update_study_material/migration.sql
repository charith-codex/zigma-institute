/*
  Warnings:

  - You are about to drop the column `fileKey` on the `StudyMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `StudyMaterial` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('pdf', 'video', 'other');

-- AlterTable
ALTER TABLE "StudentRegistration" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StudyMaterial" DROP COLUMN "fileKey",
DROP COLUMN "fileSize",
ADD COLUMN     "fileType" "FileType";
