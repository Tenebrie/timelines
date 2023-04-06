-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_revokedByEventId_fkey";

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_revokedByEventId_fkey" FOREIGN KEY ("revokedByEventId") REFERENCES "WorldEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
