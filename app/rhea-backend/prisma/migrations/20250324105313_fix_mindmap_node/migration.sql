/*
  Warnings:

  - You are about to drop the `Node` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentActorId_fkey";

-- DropTable
DROP TABLE "Node";

-- CreateTable
CREATE TABLE "MindmapNode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "parentActorId" TEXT,
    "worldId" TEXT NOT NULL,

    CONSTRAINT "MindmapNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MindmapNode_id_key" ON "MindmapNode"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MindmapNode_parentActorId_key" ON "MindmapNode"("parentActorId");

-- AddForeignKey
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_parentActorId_fkey" FOREIGN KEY ("parentActorId") REFERENCES "Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;
