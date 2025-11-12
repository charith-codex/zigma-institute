/*
  Warnings:

  - Added the required column `fileKey` to the `StudyMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudyMaterial" ADD COLUMN     "fileKey" TEXT NOT NULL;
