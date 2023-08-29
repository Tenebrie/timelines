/*
  Warnings:

  - The values [ReplacesEvent] on the enum `WorldEventField` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `replacedByEventId` on the `WorldEvent` table. All the data in the column will be lost.
  - You are about to drop the column `replacedEventId` on the `WorldEvent` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;

UPDATE "WorldEvent" SET "extraFields" = null;

CREATE TYPE "WorldEventField_new" AS ENUM ('RevokedAt', 'EventIcon', 'TargetActors', 'MentionedActors');
ALTER TABLE "WorldEvent" ALTER COLUMN "extraFields" TYPE "WorldEventField_new"[] USING ("extraFields"::text::"WorldEventField_new"[]);
ALTER TYPE "WorldEventField" RENAME TO "WorldEventField_old";
ALTER TYPE "WorldEventField_new" RENAME TO "WorldEventField";
DROP TYPE "WorldEventField_old";

-- DropForeignKey
ALTER TABLE "WorldEvent" DROP CONSTRAINT "WorldEvent_replacedEventId_fkey";

-- DropIndex
DROP INDEX "WorldEvent_replacedByEventId_key";

-- DropIndex
DROP INDEX "WorldEvent_replacedEventId_key";

-- AlterTable
ALTER TABLE "WorldEvent" DROP COLUMN "replacedByEventId",
DROP COLUMN "replacedEventId";

-- CreateTable
CREATE TABLE "WorldEventDelta" (
    "id" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "customName" BOOLEAN,
    "worldEventId" TEXT NOT NULL,

    CONSTRAINT "WorldEventDelta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldEventDelta_id_key" ON "WorldEventDelta"("id");

-- AddForeignKey
ALTER TABLE "WorldEventDelta" ADD CONSTRAINT "WorldEventDelta_worldEventId_fkey" FOREIGN KEY ("worldEventId") REFERENCES "WorldEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
