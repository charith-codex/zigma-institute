-- Drop priority field now that notifications no longer track priority levels
ALTER TABLE "Notification" DROP COLUMN "priority";

-- Remove obsolete enum
DROP TYPE "NotificationPriority";
