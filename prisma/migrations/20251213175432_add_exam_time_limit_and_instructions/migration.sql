-- AlterTable
ALTER TABLE "ExamPaper" RENAME COLUMN "description" TO "instructions";

-- AlterTable
ALTER TABLE "ExamPaper" ADD COLUMN "timeLimit" INTEGER;
