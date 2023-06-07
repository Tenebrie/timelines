-- AlterTable
ALTER TABLE "Actor" ADD COLUMN     "worldId" TEXT;

-- AddForeignKey
ALTER TABLE "Actor" ADD CONSTRAINT "Actor_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE SET NULL ON UPDATE CASCADE;
