-- AlterTable
ALTER TABLE "WorldEvent" ADD COLUMN     "worldEventTrackId" TEXT NOT NULL DEFAULT '';

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

-- Populate existing events with a default track
INSERT INTO "WorldEventTrack" ("id", "name", "position", "worldId")
SELECT 
  gen_random_uuid() AS "id",
  'Uncategorized' AS "name",
  0 AS "position",  -- Assuming a default position value of 0; adjust if needed
  "id" AS "worldId"
FROM 
  "World";

UPDATE "WorldEvent"
SET "worldEventTrackId" = (
  SELECT "id"
  FROM "WorldEventTrack"
  WHERE "WorldEventTrack"."worldId" = "WorldEvent"."worldId"
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldEventTrack_id_key" ON "WorldEventTrack"("id");

-- AddForeignKey
ALTER TABLE "WorldEvent" ADD CONSTRAINT "WorldEvent_worldEventTrackId_fkey" FOREIGN KEY ("worldEventTrackId") REFERENCES "WorldEventTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEventTrack" ADD CONSTRAINT "WorldEventTrack_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
