# Migration Guide - Exam Time Limit & Instructions Feature

## ⚡ Quick Fix for 500 Errors

If you're getting **500 Internal Server Error** on `/api/exams`:

```bash
# Run these 3 commands in order:
npx prisma generate      # Regenerate Prisma client
rm -rf .next            # Clear Next.js cache
npm run dev             # Restart dev server
```

**Why?** The Prisma client needs to be regenerated with the new `instructions` and `timeLimit` fields.

---

## Overview
This update adds `timeLimit` and `instructions` fields to the exam system, replacing the old `description` field.

## Required Steps

⚠️ **IMPORTANT:** Follow these steps IN ORDER to avoid 500 errors.

### 1. Install Dependencies
```bash
npm install
```
This will automatically run `prisma generate` via the postinstall hook.

### 2. Apply Database Migration
Choose one of the following based on your environment:

**For Development:**
```bash
npx prisma migrate dev
```

**For Production:**
```bash
npx prisma migrate deploy
```

### 3. Generate Prisma Client (Critical!)
**Even if you ran the migration, you MUST regenerate the client:**
```bash
npx prisma generate
```

This updates the TypeScript types to include `instructions` and `timeLimit`.

### 4. Verify Migration
Check that the migration was applied:
```bash
npx prisma migrate status
```

You should see: `Database schema is up to date!`

### 5. Restart Development Server
**Kill the existing process and restart:**
```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

## What Changed

### Database Schema
- **Renamed:** `ExamPaper.description` → `ExamPaper.instructions`
- **Added:** `ExamPaper.timeLimit` (nullable integer, in minutes)

### Migration File
Location: `prisma/migrations/20251213175432_add_exam_time_limit_and_instructions/migration.sql`

```sql
-- AlterTable
ALTER TABLE "ExamPaper" RENAME COLUMN "description" TO "instructions";

-- AlterTable
ALTER TABLE "ExamPaper" ADD COLUMN "timeLimit" INTEGER;
```

## Troubleshooting

### Error: GET/POST /api/exams returns 500 Internal Server Error
**Cause:** Prisma client not regenerated after migration. The client is using old types that don't include `instructions` and `timeLimit`.

**Solution:**
1. **Regenerate Prisma client:**
   ```bash
   npx prisma generate
   ```
2. **Restart your dev server** (kill existing process and restart):
   ```bash
   npm run dev
   ```
3. **Clear Next.js cache** (if still failing):
   ```bash
   rm -rf .next
   npm run dev
   ```

### Error: "Failed to fetch exams"
**Cause:** Prisma client is out of sync with database schema.

**Solution:**
1. Run `npx prisma generate` to regenerate the client
2. Check server logs for detailed Prisma errors
3. Verify migration was applied: `npx prisma migrate status`
4. Restart your dev server

### Error: "Unable to create exam"
**Cause:** Database schema doesn't have the new fields yet OR Prisma client is outdated.

**Solution:**
1. Apply the migration: `npx prisma migrate deploy`
2. **CRITICAL:** Regenerate client: `npx prisma generate`
3. Verify: `npx prisma migrate status`
4. Restart dev server

### Error: Column "description" does not exist
**Cause:** Migration was partially applied or Prisma client is outdated.

**Solution:**
1. Check migration status: `npx prisma migrate status`
2. If pending, apply: `npx prisma migrate deploy`
3. Regenerate client: `npx prisma generate`

### Starting Fresh (Development Only)
If you want to reset your database:
```bash
npx prisma migrate reset
```
⚠️ **Warning:** This will delete all data!

## Data Preservation

The migration uses `RENAME COLUMN` which preserves existing data:
- Old `description` values are now in `instructions`
- `timeLimit` defaults to `NULL` for existing exams (unlimited time)

## API Changes

### Before:
```typescript
{
  title: string;
  description?: string;
  // ...
}
```

### After:
```typescript
{
  title: string;
  instructions?: string;
  timeLimit?: number; // in minutes, 1-300
  // ...
}
```

## Need Help?

If you continue to experience issues after following these steps:
1. Check that you're on the latest commit
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check database connection: Verify `DATABASE_URL` in `.env`
4. Review error logs for specific Prisma errors
