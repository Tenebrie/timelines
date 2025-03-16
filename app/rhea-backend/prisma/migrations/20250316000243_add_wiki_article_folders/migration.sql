-- AlterTable
ALTER TABLE "WikiArticle" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WikiArticle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
