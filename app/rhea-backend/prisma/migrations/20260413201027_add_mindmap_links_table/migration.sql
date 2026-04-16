-- CreateEnum
CREATE TYPE "MindmapLinkDirection" AS ENUM ('Normal', 'Reversed', 'TwoWay');

-- CreateTable
CREATE TABLE "MindmapLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "direction" "MindmapLinkDirection" NOT NULL DEFAULT 'Normal',
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "MindmapLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MindmapLink_id_key" ON "MindmapLink"("id");

-- AddForeignKey
ALTER TABLE "MindmapLink" ADD CONSTRAINT "MindmapLink_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "MindmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindmapLink" ADD CONSTRAINT "MindmapLink_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "MindmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
