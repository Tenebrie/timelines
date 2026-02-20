-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_worldId_fkey";

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
