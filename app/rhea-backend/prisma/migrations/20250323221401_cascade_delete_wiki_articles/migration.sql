-- DropForeignKey
ALTER TABLE "WikiArticle" DROP CONSTRAINT "WikiArticle_parentId_fkey";

-- AddForeignKey
ALTER TABLE "WikiArticle" ADD CONSTRAINT "WikiArticle_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WikiArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
