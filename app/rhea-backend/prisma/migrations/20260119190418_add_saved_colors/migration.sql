-- CreateTable
CREATE TABLE "SavedColor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "SavedColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedColor_worldId_idx" ON "SavedColor"("worldId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedColor_worldId_value_key" ON "SavedColor"("worldId", "value");

-- AddForeignKey
ALTER TABLE "SavedColor" ADD CONSTRAINT "SavedColor_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
