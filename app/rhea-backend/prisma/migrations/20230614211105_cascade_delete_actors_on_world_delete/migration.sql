-- DropForeignKey
ALTER TABLE "Actor" DROP CONSTRAINT "Actor_worldId_fkey";

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
