DELETE FROM "AssetReference";

-- AlterTable
ALTER TABLE "AssetReference" ADD COLUMN     "worldId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
