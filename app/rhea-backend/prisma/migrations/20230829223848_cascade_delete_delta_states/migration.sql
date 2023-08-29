-- DropForeignKey
ALTER TABLE "WorldEventDelta" DROP CONSTRAINT "WorldEventDelta_worldEventId_fkey";

-- AddForeignKey
ALTER TABLE "WorldEventDelta" ADD CONSTRAINT "WorldEventDelta_worldEventId_fkey" FOREIGN KEY ("worldEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
