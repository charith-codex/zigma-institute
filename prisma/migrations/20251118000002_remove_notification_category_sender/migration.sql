-- Drop category and sender columns and the unused enum
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "type", DROP COLUMN IF EXISTS "sender";

DROP TYPE IF EXISTS "NotificationCategory";
