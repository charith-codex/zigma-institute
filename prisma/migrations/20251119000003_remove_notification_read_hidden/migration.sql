-- Drop channel visibility tracking columns
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "readBy";
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "hiddenFor";
