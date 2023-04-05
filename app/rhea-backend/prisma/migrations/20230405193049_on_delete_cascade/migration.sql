-- DropForeignKey
ALTER TABLE "WorldEvent" DROP CONSTRAINT "WorldEvent_worldId_fkey";

-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_issuedByEventId_fkey";

-- DropForeignKey
ALTER TABLE "WorldStatement" DROP CONSTRAINT "WorldStatement_revokedByEventId_fkey";

-- AddForeignKey
ALTER TABLE "WorldEvent" ADD CONSTRAINT "WorldEvent_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_issuedByEventId_fkey" FOREIGN KEY ("issuedByEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_revokedByEventId_fkey" FOREIGN KEY ("revokedByEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
