/*
  Warnings:

  - The values [Scene,Other] on the enum `WorldEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorldEventType_new" AS ENUM ('SCENE', 'OTHER');
ALTER TABLE "WorldEvent" ALTER COLUMN "type" TYPE "WorldEventType_new" USING ("type"::text::"WorldEventType_new");
ALTER TYPE "WorldEventType" RENAME TO "WorldEventType_old";
ALTER TYPE "WorldEventType_new" RENAME TO "WorldEventType";
DROP TYPE "WorldEventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "WorldEvent" ALTER COLUMN "description" SET DEFAULT '';
