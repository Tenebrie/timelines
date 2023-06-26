/*
  Warnings:

  - The values [REVOKED_AT,CUSTOM_NAME,EVENT_ICON,TARGET_ACTORS,MENTIONED_ACTORS] on the enum `WorldEventField` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorldEventField_new" AS ENUM ('RevokedAt', 'CustomName', 'EventName', 'TargetActors', 'MentionedActors');
ALTER TABLE "WorldEvent" ALTER COLUMN "extraFields" TYPE "WorldEventField_new"[] USING ("extraFields"::text::"WorldEventField_new"[]);
ALTER TYPE "WorldEventField" RENAME TO "WorldEventField_old";
ALTER TYPE "WorldEventField_new" RENAME TO "WorldEventField";
DROP TYPE "WorldEventField_old";
COMMIT;
