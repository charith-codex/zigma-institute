/*
  Warnings:

  - You are about to drop the column `fileType` on the `StudyMaterial` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudyMaterial" DROP COLUMN "fileType";

-- DropEnum
DROP TYPE "public"."FileType";
