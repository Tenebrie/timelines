/*
  Warnings:

  - You are about to drop the `WorldStatement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[replacedEventId]` on the table `WorldEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[replacedByEventId]` on the table `WorldEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_issuedByEventId_fkey";

-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_replacedStatementId_fkey";

-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_revokedByEventId_fkey";

-- DropForeignKey
ALTER TABLE "_EventMentionedActors" DROP CONSTRAINT "_EventMentionedActors_B_fkey";

-- DropForeignKey
ALTER TABLE "_EventTargetActors" DROP CONSTRAINT "_EventTargetActors_B_fkey";

-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "replacedByEventId" TEXT,
ADD COLUMN     "replacedEventId" TEXT,
ADD COLUMN     "revokedAt" BIGINT;

-- DropTable
DROP TABLE "WorldStatement";

-- CreateIndex
CREATE UNIQUE INDEX "WorldEvent_replacedEventId_key" ON "WorldEvent"("replacedEventId");

-- CreateIndex
CREATE UNIQUE INDEX "WorldEvent_replacedByEventId_key" ON "WorldEvent"("replacedByEventId");

-- AddForeignKey
ALTER TABLE "WorldEvent" ADD CONSTRAINT "WorldEvent_replacedEventId_fkey" FOREIGN KEY ("replacedEventId") REFERENCES "WorldEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Manually delete
DELETE FROM "_EventTargetActors";
DELETE FROM "_EventMentionedActors";

-- AddForeignKey
ALTER TABLE "_EventTargetActors" ADD CONSTRAINT "_EventTargetActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventMentionedActors" ADD CONSTRAINT "_EventMentionedActors_B_fkey" FOREIGN KEY ("B") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
