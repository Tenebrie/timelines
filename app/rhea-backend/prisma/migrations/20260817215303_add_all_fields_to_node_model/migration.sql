-- AlterEnum
ALTER TYPE "MentionedEntity" ADD VALUE 'Node';

-- AlterEnum
ALTER TYPE "ReferenceHoldingEntity" ADD VALUE 'Node';

-- AlterTable
ALTER TABLE "AssetReference" ADD COLUMN     "holderNodeId" TEXT;

-- AlterTable
ALTER TABLE "ContentPage" ADD COLUMN     "parentNodeId" TEXT;

-- AlterTable
ALTER TABLE "Mention" ADD COLUMN     "sourceNodeId" TEXT;

-- AddForeignKey
ALTER TABLE "AssetReference" ADD CONSTRAINT "AssetReference_holderNodeId_fkey" FOREIGN KEY ("holderNodeId") REFERENCES "MindmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPage" ADD CONSTRAINT "ContentPage_parentNodeId_fkey" FOREIGN KEY ("parentNodeId") REFERENCES "MindmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "MindmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
