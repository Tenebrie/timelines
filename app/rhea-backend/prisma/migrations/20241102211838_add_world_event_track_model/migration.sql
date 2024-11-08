-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "worldEventTrackId" TEXT;

-- CreateTable
CREATE TABLE "WorldEventTrack" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "WorldEventTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldEventTrack_id_key" ON "WorldEventTrack"("id");

-- AddForeignKey
ALTER TABLE "WorldEvent" ADD CONSTRAINT "WorldEvent_worldEventTrackId_fkey" FOREIGN KEY ("worldEventTrackId") REFERENCES "WorldEventTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEventTrack" ADD CONSTRAINT "WorldEventTrack_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
