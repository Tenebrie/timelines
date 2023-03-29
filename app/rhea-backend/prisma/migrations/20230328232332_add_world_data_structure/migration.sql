-- CreateEnum
CREATE TYPE "WorldEventType" AS ENUM ('Scene', 'Other');

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldEvent" (
    "id" TEXT NOT NULL,
    "type" "WorldEventType" NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "WorldEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldStatement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "issuedByEventId" TEXT NOT NULL,
    "revokedByEventId" TEXT NOT NULL,

    CONSTRAINT "WorldStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "World_id_key" ON "World"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorldEvent_id_key" ON "WorldEvent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WorldStatement_id_key" ON "WorldStatement"("id");

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "World_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEvent" ADD CONSTRAINT "WorldEvent_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_issuedByEventId_fkey" FOREIGN KEY ("issuedByEventId") REFERENCES "WorldEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldStatement" ADD CONSTRAINT "WorldStatement_revokedByEventId_fkey" FOREIGN KEY ("revokedByEventId") REFERENCES "WorldEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
