-- Drop unused schedule metadata columns
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "createdBy";
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "teacherId";
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "teacherName";

-- Remove enums that are no longer referenced
DROP TYPE IF EXISTS "ScheduleStatus";
DROP TYPE IF EXISTS "ScheduleCreatedBy";
