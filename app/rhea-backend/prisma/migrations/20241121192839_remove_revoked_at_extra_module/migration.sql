BEGIN;

-- RemoveField
UPDATE "WorldEvent"
SET "extraFields" = array_remove("extraFields", 'RevokedAt')
WHERE 'RevokedAt' = ANY("extraFields");

-- AlterEnum
CREATE TYPE "WorldEventField_new" AS ENUM ('EventIcon', 'TargetActors', 'MentionedActors', 'ExternalLink');
ALTER TABLE "WorldEvent" ALTER COLUMN "extraFields" TYPE "WorldEventField_new"[] USING ("extraFields"::text::"WorldEventField_new"[]);
ALTER TYPE "WorldEventField" RENAME TO "WorldEventField_old";
ALTER TYPE "WorldEventField_new" RENAME TO "WorldEventField";
DROP TYPE "WorldEventField_old";
COMMIT;
