-- AlterTable
ALTER TABLE "MindmapNode" ADD COLUMN     "parentFolderId" TEXT;

-- AddForeignKey
ALTER TABLE "MindmapNode" ADD CONSTRAINT "MindmapNode_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "WikiFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
