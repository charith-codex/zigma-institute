/*
  Warnings:

  - You are about to drop the column `fileKey` on the `VideoRecording` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `VideoRecording` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `VideoRecording` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VideoRecording" DROP COLUMN "fileKey",
DROP COLUMN "fileName",
DROP COLUMN "fileSize";
