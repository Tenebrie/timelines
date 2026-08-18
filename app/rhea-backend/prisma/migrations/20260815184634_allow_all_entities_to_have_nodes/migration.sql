-- AlterTable
ALTER TABLE "MindmapNode" ADD COLUMN     "parentArticleId" TEXT,
ADD COLUMN     "parentEventId" TEXT,
ADD COLUMN     "parentTagId" TEXT;

-- AddForeignKey
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_parentArticleId_fkey" FOREIGN KEY ("parentArticleId") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "WorldEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_parentTagId_fkey" FOREIGN KEY ("parentTagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
